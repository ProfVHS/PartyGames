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
const battleshipsModule = require("./modules/battleships");
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
    const userData = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, rows: User[]) => {
        if(err) {
          console.log(`Users data error:`);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    socket.nsp.to(roomCode).emit("receiveUsersData", userData);
  };
  // info about room
  const roomData = async (roomCode: string, socket: Socket) => {
    const roomData = await new Promise<Room>((resolve, reject) => {
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
        if(err) {
          console.log(`Room data error:`);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    socket.nsp.to(roomCode).emit("receiveRoomData", roomData);
  };
  // reset data about users
  const usersResetData = async (roomCode: string, socket: Socket) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET alive = true, id_selected = 0 WHERE id_room = "${roomCode}"`, [], (err) => {
        if (err) {
          console.log("Users reset error");
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
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET turn = 0, ready = 0, time_left = 0, time_max = 0, in_game = false, round = 0 WHERE id = "${roomCode}"`, [], (err) => {
        if (err) {
          console.log("Room reset error");
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
    const updateTurn = new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET turn = ${turn} WHERE id = "${roomCode}"`, (err) => {
        if(err){
            console.log("Update Room Turn error");
            reject(err);
        } else {
            resolve();
        }
      });
    });

    const users = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = true`, [], (err: Error, users_rows: User[]) => {
        if (err) {
          console.log("Users (Update Room Turn) error");
          reject(err);
        } else {
          resolve(users_rows);
        }
      });
    });

    const room = await new Promise<Room>((resolve, reject) => {
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
        if (err) {
          console.log("Room (Update Room Turn) error");
          reject(err);
        } else {
          resolve(room_row);
        }
      });
    });

    updateTurn.then(async () => {
      
        Promise.all([updateTurn, users, room]).then(() => {
          const username = users[room.turn].username;
          const id = users[room.turn].id;
          socket.nsp.to(roomCode).emit("receiveTurnCtb", { username, id });
        });
          
    }).catch((error: Error) => {
      console.log("Error Promise all Update Room Turn", error);
    });
  };
  // change turn
  const changeRoomTurn = async (roomCode: string, socket: Socket) => {
    const users = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, users_rows: User[]) => {
        if (err) {
          console.log("Users (Change Turn) error");
          reject(err);
        } else {
          resolve(users_rows);
        }
      });
    });
    
    const room = await new Promise<Room>((resolve, reject) => {
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
        if (err) {
          console.log("Room (Change Turn) error");
          reject(err);
        } else {
          resolve(room_row);
        }
      });
    });

    Promise.all([users, room]).then(() => {
      // turn_row.turn (0-7), users_rows.length (2-8)
      // if last user, turn = 0, else turn + 1

      const skipTurn = (x: number) => {
        
        if(users[room.turn+1].alive == false || users[room.turn+1].isDisconnect == true){
          skipTurn(x+1);
        }
      }



      const nextTurn = () => {
        if (room.turn >= users.length - 1) {
          updateRoomTurn(roomCode, 0, socket);
        } else {
          updateRoomTurn(roomCode, room.turn + 1, socket);
        }
      }
      
    }).catch((error: Error) => {
      console.log("Error Change Turn", error);
    });
  };
  // set time in room
  const updateRoomTime = async (roomCode: string, time_left: number, time_max: number) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET time_left = ${time_left}, time_max = ${time_max} WHERE id = "${roomCode}"`, (err) => {
        if(err){
          console.log("Update Room Time error");
          reject(err);
        }
      });
    });
  };
  // set round in room
  const updateRoomRound = async (roomCode: string, round: number, socket: Socket) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET round = ${round} WHERE id = "${roomCode}"`, (err) => {
        if(err){
          console.log("Update Room Round error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  // change round in room
  const changeRoomRound = async (roomCode: string, socket: Socket) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE rooms SET round = round + 1 WHERE id = "${roomCode}"`, [], (err) => {
        if (err) {
          console.log("Change Room Round error");
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
          console.log("Update Selected error");
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
          console.log("Update User Alive error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // change alive users
  const updateUsersAlive = async (roomCode: string, alive: boolean) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET alive = ${alive} WHERE id_room = "${roomCode}"`, (err) => {
        if(err){
          console.log("Update Users Alive error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // update user score by adding score
  const updateUserScore = async (id: string, score: number, socket: Socket) => {
    const updateScore = await new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET "score" = ROUND(score + ${score}) WHERE id = "${id}"`, (err) => {
        if(err){
          console.log("Update User Score error");
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const user = await new Promise<User>((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = "${id}"`, [], (err: Error, row: User) => {
        if (err) {
          console.log("User (Update User Score) error");
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    Promise.all([updateScore, user]).then(async () => {
      console.log("Then updateScore");
      console.log("Update values - ",id, score);
      console.log("User values - ",user.id, user.score);

      if(user.score < 0){
        updateUserScoreMultiply(user.id_room, user.id, 0, socket);
      } else {
        await usersData(user.id_room, socket);
      }
    });

  };

  // update user score by multiplying score
  const updateUserScoreMultiply = async (roomCode: string, id: string, score: number, socket: Socket) => {
    new Promise<void>((resolve, reject) => {
      db.run(`UPDATE users SET score = ROUND(score * ${score}) WHERE id = "${id}"`, (err) => {
        if(err){
          console.log(err);
          reject(err);
        } else {
          console.log("Update Score - ",id, score);
          resolve();
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
