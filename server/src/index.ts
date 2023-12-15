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
  id_room: string
};

export interface Room {
  id: string, 
  turn: number, 
  ready: number, 
  time_left: number, 
  time_max: number,
  in_game: boolean
};

const roomModule = require("./modules/room");
const bombModule = require("./modules/clickthebomb");
const cardsModule = require("./modules/cards");
const diamondModule = require("./modules/diamonds");

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
      'CREATE TABLE rooms ("id" VARCHAR(5) NOT NULL PRIMARY KEY, "turn" INTEGER NOT NULL, "ready" INTEGER NOT NULL, "time_left" INTEGER NOT NULL, "time_max" INTEGER NOT NULL, "in_game" BOOLEAN NOT NULL);'
    );
    db.run(
      'CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "alive" BOOLEAN NOT NULL, "id_room" VARCHAR(5) NOT NULL, "id_selected" INTEGER NOT NULL, FOREIGN KEY ("id_room") REFERENCES rooms ("id"));'
    );
    // games tables
    // click the bomb
    db.run(
      'CREATE TABLE bomb ("id" VARCHAR(5) NOT NULL PRIMARY KEY, "counter" INTEGER NOT NULL, "max" INTEGER NOT NULL);'
    );
    // cards
    db.run(
      'CREATE TABLE cards ("id" INTEGER NOT NULL PRIMARY KEY, "id_card" INTEGER NOT NULL, "id_room" VARCHAR(5) NOT NULL, "isPositive" BOOLEAN NOT NULL, "score" INTEGER NOT NULL, FOREIGN KEY ("id_room") REFERENCES rooms ("id"));'
    );
  });

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // info about room
  const roomData = async (room: string, socket: Socket) => {
    return new Promise<Room>((resolve, reject) => { 
      db.get(`SELECT * FROM rooms WHERE id = "${room}"`, [], (err: Error, row: Room) => {
        if(err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    }).then((row) => {
      socket.nsp.to(room).emit("receiveRoomData", row);
    });
  };

  // update turn
  const updateRoomTurn = async (room: string, turn: number, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
        const turnQuery = `UPDATE rooms SET turn = ${turn} WHERE id = "${room}"`;

        db.run(turnQuery, (err) => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    }).then(async () => {
      return new Promise<[Room, User[]]>((resolve, reject) => {
        Promise.all([
          new Promise<Room>((resolveRoom, rejectRoom) => {
            db.get(`SELECT * FROM rooms WHERE id = "${room}"`, [], (err: Error, room_row: Room) => {
              if (err) {
                rejectRoom(err);
              } else {
                resolveRoom(room_row);
              }
            });
          }),
          new Promise<User[]>((resolveUsers, rejectUsers) => {
            db.all(`SELECT * FROM users WHERE id_room = "${room}" AND alive = true`, [], (err: Error, users_rows: User[]) => {
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
    });
  };

  // change turn
  const changeRoomTurn = async (room: string, socket: Socket) => {
    return new Promise<[Room, User[]]>((resolve, reject) => {
      Promise.all([
        new Promise<Room>((resolveRoom, rejectRoom) => {
          db.get(`SELECT * FROM rooms WHERE id = "${room}"`, [], (err: Error, room_row: Room) => {
            if (err) {
              rejectRoom(err);
            } else {
              resolveRoom(room_row);
            }
          });
        }),
        new Promise<User[]>((resolveUsers, rejectUsers) => {
          db.all(`SELECT * FROM users WHERE id_room = "${room}" AND alive = true`, [], (err: Error, users_rows: User[]) => {
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

  // set is room in game
  const updateRoomInGame = async (room: string, in_game: boolean) => {
    db.run(`UPDATE rooms SET in_game = ${in_game} WHERE id = ${room}`);
  };

  // set time in room
  const updateRoomTime = async (room: string, time_left: number, time_max: number) => {
    db.run(`UPDATE rooms SET time_left = ${time_left}, time_max = ${time_max} WHERE id = ${room}`);
  };
  
  // info about users
  const usersData = async (room: string, socket: Socket) => {
    return new Promise<User[]>((resolve, reject) => { 
      db.all(`SELECT * FROM users WHERE id_room = "${room}"`, [], (err: Error, rows: User[]) => {
        if(err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }).then((rows) => {
      socket.nsp.to(room).emit("receiveUsersData", rows);
    });
  };

  const updateUserSelected = async (id: string, selected: number) => {
    db.run(`UPDATE users SET id_selected = ${selected} WHERE id = "${id}"`);
  };

  // change alive user
  const updateUserAlive = async (id: string, alive: boolean) => {
    db.run(`UPDATE users SET alive = ${alive} WHERE id = "${id}"`);
  };
  // change alive users
  const updateUsersAlive = async (room: string, alive: boolean) => {
    db.run(`UPDATE users SET alive = ${alive} WHERE id_room = ${room}`);
  };

  // update user score by adding score
  const updateUserScore = async (id: string, score: number, socket: Socket) => {
    return new Promise<User | void>((resolve, reject) => {
      Promise.all([
        new Promise<User>((resolve, reject) => {
          db.get(`SELECT * FROM users WHERE id = "${id}"`, [], (err: Error, row: User) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        }),
        new Promise<void>((resolve, reject) => {
          const updateScore = `UPDATE users SET "score" = ROUND(score + ${score}) WHERE id = "${id}"`;

          db.run(updateScore, (err) => {
            if(err){
              reject(err);
            } else {
              resolve();
            }
          });
        }),
      ])
      .then(async ([row]) => {
        console.log("Then updateScore");
        console.log(id, score);
        await usersData(row.id_room.toString(), socket);
      });
  });
     
    
    // return new Promise<User>((resolve, reject) => {
    //   db.get(`SELECT * FROM users WHERE id = "${id}"`, [], (err: Error, row: User) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(row);
    //     }
    //   });
    // }).then((row) => {
    //   if(row.score < 0){
    //     db.run(`UPDATE users SET "score" = 0 WHERE "id" = '${id}'`, (err) => {
    //       if(err){
    //         console.log(err);
    //       } else {
    //         console.log("Update Score - ",id, "0");
    //       }
    //     });
    //   }
    // });
  };
  // update user score by multiplying score
  const updateUserScoreMultiply = async (id: string, score: number, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
      const updateScore = `UPDATE users SET score = ROUND(score * ${score}) WHERE id = "${id}"`;

      db.run(updateScore, (err) => {
        if(err){
          console.log(err);
        } else {
          console.log("Update Score - ",id, score);
        }
      });
    }).then(async () => {
      await usersData(id, socket);
    });
  };

  

  const handleModulesOnConnection = (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    roomModule(io, socket, db, usersData, roomData);
    bombModule(io, socket, db, usersData, updateRoomTurn, changeRoomTurn, updateUserScore, updateUserScoreMultiply, updateUserAlive, updateUsersAlive, updateRoomInGame);
    cardsModule(io, socket, db, usersData, updateUserScore, updateRoomInGame, updateRoomTime, updateUserSelected);
    diamondModule(io, socket, db);
  };

  io.on("connection", handleModulesOnConnection);
});
