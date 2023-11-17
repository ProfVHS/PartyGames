const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { count } = require("console");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const app = express();
app.use(cors());

const server = http.createServer(app);

server.listen(3000, async () => {
  db.serialize(() => {
    // users and rooms table
    db.run('CREATE TABLE rooms ("id" INTEGER NOT NULL PRIMARY KEY, "turn" INTEGER NOT NULL, "ready" INTEGER NOT NULL);');
    db.run('CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "alive" BOOLEAN NOT NULL, "id_room" INTEGER NOT NULL, FOREIGN KEY ("id_room") REFERENCES rooms ("id"));');
    // games table
    db.run('CREATE TABLE bomb ("id" INTEGER NOT NULL PRIMARY KEY, "counter" VARCHAR(255) NOT NULL, "max" INTEGER NOT NULL, FOREIGN KEY ("id") REFERENCES room ("id"));');
  });
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const disconnectUser = (currentRoomId, row, socket) => {
  socket.nsp.to(currentRoomId).emit("user_disconnected", row);   
                   
  // info for the console
  console.log(`User disconnected: ${socket.id}`);

  // delete user from database
  db.run(`DELETE FROM users WHERE id = "${socket.id}"`);

  // update users list
  db.all(`SELECT * FROM users WHERE id_room = ${currentRoomId}`, [], (err, rows) => {
    if(!err){
      socket.nsp.to(currentRoomId).emit("receive_users", rows);
    }
  });  
}
// 1 - Game Click the bomb
// set max and counter
const updateDataBomb = (max,counter,room) => {
  db.run(`UPDATE bomb SET max = ${max}, counter = ${counter} WHERE id = ${room}`);
  console.log("Bomb updated");
};
// set users as dead
const updateAliveUsers = (bool,room) => {
  db.run(`UPDATE users SET alive = ${bool} WHERE id_room = ${room}`);
};
// set user as dead 
const updateAliveUser = (bool,id) => {
  db.run(`UPDATE users SET alive = ${bool} WHERE id = "${id}"`);
  console.log("user " + id + " is dead");
};
// change score of the user
const updateScore = (socket, score) => {
  db.run(`UPDATE users SET score = score + ${score} WHERE id = "${socket.id}"`);
};
// set turn
const updateRoomTurn = async (turn,room, socket) => {
  await db.run(`UPDATE rooms SET turn = ${turn} WHERE id = ${room}`);

  db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
    db.all(`SELECT id, username FROM users WHERE id_room = ${room} AND alive = true`, [], (err, rows) => {
      if(!err){
        console.log("Update turn:");
        console.log(rows);
        console.log(row.turn);
        const username = rows[row.turn].username;
        const id = rows[row.turn].id;
        socket.nsp.to(room).emit("receive_ctb_turn", {username, id});
      }
    });
  });
};
// change turn turn
const changeRoomTurn = async (room, socket) => {
  await db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
    db.all(`SELECT * FROM users WHERE id_room = ${room} AND alive = true`, [], (err, rows) => {
      if(!err){
        if(row.turn + 1 > rows.length - 1) {
          updateRoomTurn(0, room, socket);
        } else {
          updateRoomTurn(row.turn+1, room, socket);
        }        
      }
    });
  });
};

const Join = require("./join")(io, db);
const Room = require("./room")(io, db, updateRoomTurn, updateDataBomb, disconnectUser);
const Ctb = require("./click-the-bomb")(io, db, updateDataBomb, changeRoomTurn, updateAliveUser, updateAliveUsers);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
});