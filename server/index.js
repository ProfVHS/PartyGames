const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

require("dotenv").config();

const activeRooms = new Set();

const app = express();
app.use(cors());

const server = http.createServer(app);

server.listen(3000, async () => {
  db.serialize(() => {
    db.run('CREATE TABLE rooms ("id" INTEGER NOT NULL PRIMARY KEY, "code" INTEGER NOT NULL);');
    db.run('CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "id_rooms" INTEGER NOT NULL, FOREIGN KEY ("id_rooms") REFERENCES rooms ("id"));');
  });
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const users = {};

//const Join = require("./join-room")(io);
//const Disconnect = require("./disconnect-room")(io);
//const Update = require("./update-room")(io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  var currentRoomId;


  // homepage, check room existence
  socket.on("checkRoomExistence", (room) => {
    socket.emit("roomExistenceResponse", activeRooms.has(room) ? true : false);
  });

  // create room
  socket.on("create-room", async (data) => {
    socket.join(data.randomRoomCode);
    currentRoomId = data.randomRoomCode;

    db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES ("${socket.id}", "${data.name}", 0, ${data.randomRoomCode})`);
  
    db.all(`SELECT * FROM users WHERE id_rooms = ${data.randomRoomCode}`, [], (err, rows) => {
      if(!err){
        rows.forEach((row) => {row})
        socket.nsp.to(data.randomRoomCode).emit("receive_users", rows);
      }
    });
    
    activeRooms.add(data.randomRoomCode);
  });

  // join room
  socket.on("join-room", async (data) => {
    socket.join(data.roomCode);
    currentRoomId = data.roomCode;

    db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES ("${socket.id}", "${data.name}", 0, ${data.roomCode})`);
  
    db.all(`SELECT * FROM users WHERE id_rooms = ${data.roomCode}`, [], (err, rows) => {
      if(!err){
        rows.forEach((row) => {row});
        socket.nsp.to(data.roomCode).emit("receive_users", rows);
      }
    });
  });

  // users get up to date data
  socket.on("joined", async (room) => {
    await db.all(`SELECT * FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
    rows.forEach((row) => {row});
    socket.nsp.to(room).emit("receive_users", rows);
    });
  });

  // how many players are ready
  socket.on("send_value", (data) => {
      socket.nsp.to(data.roomCode).emit("recive_value", data.temp);
  });

  // disconnect user
  socket.on("disconnect", () => {
    // data from the user that disconnected
    db.all(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err, rows) => {
      if(!err){
        rows.forEach((row) => {row});
        socket.nsp.to(currentRoomId).emit("user_disconnected", rows);
      }
    });

    // info for the console
    console.log(`User disconnected: ${socket.id}`);

    // delete user from database
    db.run(`DELETE FROM users WHERE id = "${socket.id}"`);

    // update users list
    db.all(`SELECT * FROM users WHERE id_rooms = ${currentRoomId}`, [], (err, rows) => {
      if(!err){
        rows.forEach((row) => {row});
        socket.nsp.to(currentRoomId).emit("receive_users", rows);
      }
    });
  });
});


