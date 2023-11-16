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

// set max and counter
const updateDataBomb = (max,counter,room) => {
  db.run(`UPDATE bomb SET max = ${max}, counter = ${counter} WHERE id = ${room}`);
};
// set turn
const updateRoomTurn = (turn,room,socket) => {
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
  db.run(`UPDATE users SET score = score + ${score} WHERE id = "${socket.id}"`);
};

const Join = require("./join")(io, db);
const Room = require("./room")(io, db, updateRoomTurn);
const Ctb = require("./click-the-bomb")(io, db, updateDataBomb, updateRoomTurn, updateAliveUsers);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
});