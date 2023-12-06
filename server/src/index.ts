import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import sqlite3 from "sqlite3";

export interface User {
  id: string, 
  username: string, 
  score: number, 
  alive: boolean, 
  id_room: number
};

export interface Room {
  id: number, 
  turn: number, 
  ready: number, 
  time_left: number, 
  time_max: number,
  in_game: boolean
};

const roomModule = require("./modules/room");
const bombModule = require("./modules/clickthebomb");
const cardsModule = require("./modules/cards");

const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

const app = express();
app.use(cors());

const server = createServer(app);

server.listen(3000, async () => {
  db.serialize(() => {
    // users and rooms table
    db.run(
      'CREATE TABLE rooms ("id" INTEGER NOT NULL PRIMARY KEY, "turn" INTEGER NOT NULL, "ready" INTEGER NOT NULL, "time_left" INTEGER NOT NULL, "time_max" INTEGER NOT NULL, "in_game" BOOLEAN NOT NULL);'
    );
    db.run(
      'CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "alive" BOOLEAN NOT NULL, "id_room" INTEGER NOT NULL, FOREIGN KEY ("id_room") REFERENCES rooms ("id"));'
    );
    // games tables
    db.run(
      'CREATE TABLE bomb ("id" INTEGER NOT NULL PRIMARY KEY, "counter" INTEGER NOT NULL, "max" INTEGER NOT NULL);'
    );
  });

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // info about users and room
  const usersData = async (room: string, socket: Socket) => {
    db.all(`SELECT * FROM users WHERE id_room = ${room}`, [], (err, rows) => {
      if (!err) {
        socket.nsp.to(room).emit("receiveUsersData", rows);
      }
    });
  };
  const roomData = async (room: string, socket: Socket) => {
    db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
      if (!err) {
        socket.nsp.to(room).emit("receiveRoomData", row);
      }
    });
  };

  // update turn
  const updateRoomTurn = async (room: string, turn: number, socket: Socket) => {
    db.run(`UPDATE rooms SET turn = ${turn} WHERE id = ${room}`);
  
    return new Promise<[Room, User[]]>((resolve, reject) => {
      Promise.all([
        new Promise<Room>((resolveRoom, rejectRoom) => {
          db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err: Error, room_row: Room) => {
            if (err) {
              rejectRoom(err);
            } else {
              resolveRoom(room_row);
            }
          });
        }),
        new Promise<User[]>((resolveUsers, rejectUsers) => {
          db.all(`SELECT * FROM users WHERE id_room = ${room} AND alive = true`, [], (err: Error, users_rows: User[]) => {
            if (err) {
              rejectUsers(err);
            } else {
              resolveUsers(users_rows);
            }
          });
        }),
      ]).then(([room_row, users_rows]) => {
        resolve([room_row, users_rows]);
      }).catch((error) => {
        reject(error);
      });
    }).then(([room_row, users_rows]) => {
      // send turn info to the client
      const username = users_rows[room_row.turn].username;
      const id = users_rows[room_row.turn].id;
      socket.nsp.to(room).emit("receiveTurnCtb", { username, id });
    });
  };
  // change turn
  const changeRoomTurn = async (room: string, socket: Socket) => {
    return new Promise<[Room, User[]]>((resolve, reject) => {
      Promise.all([
        new Promise<Room>((resolveRoom, rejectRoom) => {
          db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err: Error, room_row: Room) => {
            if (err) {
              rejectRoom(err);
            } else {
              resolveRoom(room_row);
            }
          });
        }),
        new Promise<User[]>((resolveUsers, rejectUsers) => {
          db.all(`SELECT * FROM users WHERE id_room = ${room} AND alive = true`, [], (err: Error, users_rows: User[]) => {
            if (err) {
              rejectUsers(err);
            } else {
              resolveUsers(users_rows);
            }
          });
        }),
      ]).then(([room_row, users_rows]) => {
        resolve([room_row, users_rows]);
      }).catch((error) => {
        reject(error);
      });
    }).then(([room_row, users_rows]) => {
      // turn_row.turn (0-7), users_rows.length (2-8)
      // if last user, turn = 0, else turn + 1
      if (room_row.turn >= users_rows.length - 1) {
        updateRoomTurn(room, 0, socket);
      } else {
        updateRoomTurn(room, room_row.turn + 1, socket);
      }
    });
  };

  // change alive user
  const updateUserAlive = (id: string, alive: boolean) => {
    db.run(`UPDATE users SET alive = ${alive} WHERE id = "${id}"`);
  };
  // change alive users
  const updateUsersAlive = (room: string, alive: boolean) => {
    db.run(`UPDATE users SET alive = ${alive} WHERE id_room = ${room}`);
  };

  // update user score by adding score
  const updateUserScore = async (id: string, score: number) => {
    db.run(`UPDATE users SET score = ROUND(score + ${score}) WHERE id = "${id}"`);

    console.log(id, score);
    // return new Promise<User>((resolve, reject) => {
    //   db.get(`SELECT * FROM users WHERE id = "${id}"`, [], (err: Error, row: User) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(row);
    //     }
    //   });
    // }).then((row) => {
    //   return row.score;
    // });
  };
  // update user score by multiplying score
  const updateUserScoreMultiply = (id: string, score: number) => {
    db.run(`UPDATE users SET score = ROUND(score * ${score}) WHERE id = "${id}"`);
  };

  // set is room in game
  const updateRoomInGame = (room: string, in_game: boolean) => {
    db.run(`UPDATE rooms SET in_game = ${in_game} WHERE id = ${room}`);
  };

  // set time in room
  const updateRoomTime = (room: string, time_left: number, time_max: number) => {
    db.run(`UPDATE rooms SET time_left = ${time_left}, time_max = ${time_max} WHERE id = ${room}`);
  };

  const handleModulesOnConnection = (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    roomModule(io, socket, db, usersData, roomData);
    bombModule(io, socket, db, usersData, updateRoomTurn, changeRoomTurn, updateUserScore, updateUserScoreMultiply, updateUserAlive, updateUsersAlive, updateRoomInGame);
    cardsModule(io, socket, db, usersData, updateUserScore, updateRoomInGame, updateRoomTime);
    
  };

  io.on("connection", handleModulesOnConnection);
});
