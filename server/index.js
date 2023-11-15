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
    db.run('CREATE TABLE rooms ("id" INTEGER NOT NULL PRIMARY KEY, "turn" INTEGER NOT NULL);');
    db.run('CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "alive" BOOLEAN NOT NULL, "id_rooms" INTEGER NOT NULL, FOREIGN KEY ("id_rooms") REFERENCES rooms ("id"));');
    // games table
    db.run('CREATE TABLE bomb ("id" INTEGER NOT NULL PRIMARY KEY, "counter" VARCHAR(255) NOT NULL, "max" INTEGER NOT NULL, FOREIGN KEY ("id") REFERENCES rooms ("id"));');
  });
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

var currentRoomId;

// set max and counter
const updateDataBomb = (max,counter,room) => {
  db.run(`UPDATE bomb SET max = ${max}, counter = ${counter} WHERE id = ${room}`);
};
// set turn
const updateRoomTurn = (turn,room, socket) => {
  db.run(`UPDATE rooms SET turn = ${turn} WHERE id = ${room}`);
  db.all(`SELECT id, username FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows) => {
    const username = rows[turn].username;
    const id = rows[turn].id;
    socket.nsp.to(room).emit("receive_ctb_turn", {username, id});
  });
};
// set user as dead 
const updateAliveUsers = (socket) => {
  db.run(`UPDATE users SET alive = false WHERE id = "${socket.id}"`);
};
// change score of the user
const updateScore = (socket, score) => {
  db.run(`UPDATE users SET score = ${score} WHERE id = "${socket.id}"`);
};

const Join = require("./join-room")(io, db);
const Disconnect = require("./disconnect-room")(io, db, currentRoomId);
const Update = require("./update-room")(io, db);
const Ctb = require("./click-the-bomb")(io, db, updateDataBomb, updateRoomTurn, updateAliveUsers);


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // homepage, check room existence
  socket.on("checkRoomExistence", (room) => {
    db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
      if(!err){
        socket.emit("roomExistenceResponse", row ? true : false);
      }
    });
  });

  // how many players are ready
  socket.on("send_value", async (data) => {
      socket.nsp.to(data.roomCode).emit("recive_value", data.newPlayersReady);
      await db.all(`SELECT * FROM users WHERE id_rooms = ${data.roomCode}`, [], (err, rows) => {
        if(data.newPlayersReady == rows.length){
          // min - 1, max - users.lenght * 5 (max number of clicks)
          const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
          const turn = Math.round(Math.random() * (rows.length - 1));
          updateDataBomb(max,0,data.roomCode);
          updateRoomTurn(turn,data.roomCode,socket);
          const username = rows[turn].username;
          const id = rows[turn].id;
          console.log(turn);
          socket.nsp.to(data.roomCode).emit("receive_ctb_turn", {username, id});
        }
      });
  });
});