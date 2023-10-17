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
  console.log("serwer cię słyszy");

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

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // homepage, check room existence
  socket.on("checkRoomExistence", (room) => {
    socket.emit("roomExistenceResponse", activeRooms.has(room) ? true : false);
  });

  socket.on("create-room", async (data) => {

    db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES ("${socket.id}", "${data.username}", 0, ${data.randomRoomCode})`, [], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log(`A row has been inserted`);
    });
  
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err){
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
    });

    activeRooms.add(data.roomCode);
  });

<<<<<<< HEAD
  socket.on("join-room", async (data) => {
    socket.join(data.roomCode);
=======
  // users data
  socket.on("joined", async (room) => {
    const data = await users.findOne({ roomcode: room });
>>>>>>> 2ec637b555eb4335aa3dd90c18d3e38a3838ca3a

    db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES (${socket.id}, "${data.username}", 0, ${data.roomCode})`, [], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log(`A row has been inserted`);
    });
  
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err){
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
    });
  });

  // socket.on("joined", async (room) => {
  //   socket.nsp.to(room).emit("receive_users", data);
  // });

  socket.on("send_value", (data) => {
    socket.nsp.to(data.roomCode).emit("recive_value", data.temp);
  });

  // ready
  socket.on("send_value", (room, value) => {
    const data = value;
    socket.to(room).emit("receive_value", data);
  });

});

<<<<<<< HEAD
=======
io.on("disconnect", () => {
  
});
>>>>>>> 2ec637b555eb4335aa3dd90c18d3e38a3838ca3a
