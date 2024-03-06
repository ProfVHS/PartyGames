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
  isDisconnect: boolean,
  id_room: string,
  id_selected: number,
  position: number,
};

export interface Room {
  id: string, 
  turn: number, 
  ready: number, 
  time_left: number, 
  time_max: number,
  in_game: boolean,
  round: number,
};

const roomModule = require("./modules/room");
const bombModule = require("./modules/clickthebomb");
const cardsModule = require("./modules/cards");
const diamondModule = require("./modules/diamonds");
const colorsMemoryModule = require("./modules/colorsmemory");
const buddiesModule = require("./modules/buddies");

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
      'CREATE TABLE rooms ("id" VARCHAR(5) NOT NULL PRIMARY KEY, "turn" INTEGER NOT NULL, "ready" INTEGER NOT NULL, "time_left" INTEGER NOT NULL, "time_max" INTEGER NOT NULL, "in_game" BOOLEAN NOT NULL, "round" INTEGER NOT NULL);'
    );
    db.run(
      'CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "alive" BOOLEAN NOT NULL, "isDisconnect" BOOLEAN NOT NULL, "id_room" VARCHAR(5) NOT NULL, "id_selected" INTEGER NOT NULL, "position" INTEGER NOT NULL, FOREIGN KEY ("id_room") REFERENCES rooms ("id"));'
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

  //#region Data about rooms and users
  // info about users
  const usersData = async (roomCode: string, socket: Socket) => {
    return new Promise<User[]>((resolve, reject) => { 
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, rows: User[]) => {
        if(err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }).then((rows) => {
      socket.nsp.to(roomCode).emit("receiveUsersData", rows);
    });
  };
  // info about room
  const roomData = async (roomCode: string, socket: Socket) => {
    return new Promise<Room>((resolve, reject) => { 
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
        if(err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    }).then((row) => {
      socket.nsp.to(roomCode).emit("receiveRoomData", row);
    });
  };
  // reset data about users
  const usersResetData = async (roomCode: string, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET alive = true, id_selected = 0 WHERE id_room = "${roomCode}"`, [], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(() => {
      usersData(roomCode, socket);
    });
  };
  // reset data about room
  const roomResetData = async (roomCode: string, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET turn = 0, ready = 0, time_left = 0, time_max = 0, in_game = false, round = 0 WHERE id = "${roomCode}"`, [], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(() => {
      roomData(roomCode, socket);
    });
  };
  //#endregion

  //#region Update data about rooms (turn, time, round)
  // update turn
  const updateRoomTurn = async (roomCode: string, turn: number, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
        const turnQuery = `UPDATE rooms SET turn = ${turn} WHERE id = "${roomCode}"`;

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
            db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
              if (err) {
                rejectRoom(err);
              } else {
                resolveRoom(room_row);
              }
            });
          }),
          new Promise<User[]>((resolveUsers, rejectUsers) => {
            db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = true`, [], (err: Error, users_rows: User[]) => {
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
        socket.nsp.to(roomCode).emit("receiveTurnCtb", { username, id });
      });
    });
  };
  // change turn
  const changeRoomTurn = async (roomCode: string, socket: Socket) => {
    return new Promise<[Room, User[]]>((resolve, reject) => {
      Promise.all([
        new Promise<Room>((resolveRoom, rejectRoom) => {
          db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
            if (err) {
              rejectRoom(err);
            } else {
              resolveRoom(room_row);
            }
          });
        }),
        new Promise<User[]>((resolveUsers, rejectUsers) => {
          db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = true`, [], (err: Error, users_rows: User[]) => {
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
        updateRoomTurn(roomCode, 0, socket);
      } else {
        updateRoomTurn(roomCode, room_row.turn + 1, socket);
      }
    });
  };
  // set time in room
  const updateRoomTime = async (roomCode: string, time_left: number, time_max: number) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET time_left = ${time_left}, time_max = ${time_max} WHERE id = "${roomCode}"`, (err) => {
        if(err){
          console.log("Room time error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  // set round in room
  const updateRoomRound = async (roomCode: string, round: number, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET round = ${round} WHERE id = "${roomCode}"`, (err) => {
        if(err){
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  // change round in room
  const changeRoomRound = async (roomCode: string, socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET round = round + 1 WHERE id = "${roomCode}"`, [], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  //#endregion

  //#region Update data about users (selected, alive, score)
  const updateUserSelected = async (id: string, selected: number) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET id_selected = ${selected} WHERE id = "${id}"`, (err) => {
        if(err){
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // change alive user
  const updateUserAlive = async (id: string, alive: boolean) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET alive = ${alive} WHERE id = "${id}"`, (err) => {
        if(err){
          reject(err);
        } else {
          console.log("Update Alive - ",id, alive);
          resolve();
        }
      });
    });
  };

  // change alive users
  const updateUsersAlive = async (roomCode: string, alive: boolean) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET alive = ${alive} WHERE id_room = "${roomCode}"`, (err) => {
        if(err){
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // update user score by adding score
  const updateUserScore = async (id: string, score: number, socket: Socket) => {
    return new Promise<void | User>((resolve, reject) => {
      Promise.all([
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
        new Promise<User>((resolve, reject) => {
          db.get(`SELECT * FROM users WHERE id = "${id}"`, [], (err: Error, row: User) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        }),
      ])
      .then(async ([,row]) => {
        console.log("Then updateScore");
        console.log("Update values - ",id, score);
        console.log("User values - ",row.id, row.score);
        if(row.score < 0){
          updateUserScoreMultiply(row.id_room, row.id, 0, socket);
        } else {
          await usersData(row.id_room, socket);
        }
      });
    });
  };

  // update user score by multiplying score
  const updateUserScoreMultiply = async (roomCode: string, id: string, score: number, socket: Socket) => {
    new Promise((resolve, reject) => {
      const updateScore = `UPDATE users SET score = ROUND(score * ${score}) WHERE id = "${id}"`;

      db.run(updateScore, (err) => {
        if(err){
          console.log(err);
        } else {
          console.log("Update Score - ",id, score);
        }
      });
    })
    await usersData(roomCode, socket);
  
  };

  //#endregion
  

  const handleModulesOnConnection = (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    roomModule(io, socket, db, usersData, roomData, updateUserSelected, updateUserAlive, changeRoomTurn, updateRoomTurn);
    bombModule(io, socket, db, usersData, updateRoomTurn, changeRoomTurn, updateUserScore, updateUserScoreMultiply, updateUserAlive, updateUsersAlive);
    cardsModule(io, socket, db, updateUserScore, roomData, updateRoomTime, updateRoomRound, changeRoomRound);
    diamondModule(io, socket, db, updateUserScore, updateRoomTime, updateRoomRound, changeRoomRound);
    colorsMemoryModule(io, socket, db, usersData, updateRoomRound, changeRoomRound, updateUserAlive, updateUsersAlive);
    buddiesModule(io, socket, db, changeRoomRound);
  };

  io.on("connection", handleModulesOnConnection);
});
