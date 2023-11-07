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

const activeRooms = new Set();

const app = express();
app.use(cors());

const server = http.createServer(app);

server.listen(3000, async () => {
  db.serialize(() => {
    // users and rooms table
    db.run('CREATE TABLE rooms ("id" INTEGER NOT NULL PRIMARY KEY);');
    db.run('CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "id_rooms" INTEGER NOT NULL, FOREIGN KEY ("id_rooms") REFERENCES rooms ("id"));');
    // games table
    db.run('CREATE TABLE bomb ("id" INTEGER NOT NULL PRIMARY KEY, "turn" VARCHAR(255) NOT NULL, "counter" VARCHAR(255) NOT NULL, "max" INTEGER NOT NULL, FOREIGN KEY ("id") REFERENCES rooms ("id"));');
  });
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//const Join = require("./join-room")(io);
//const Disconnect = require("./disconnect-room")(io);
//const Update = require("./update-room")(io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  var currentRoomId;
  var turn = 0;

  // homepage, check room existence
  socket.on("checkRoomExistence", (room) => {
    socket.emit("roomExistenceResponse", activeRooms.has(room) ? true : false);
  });

  // create room
  socket.on("create-room", async (data) => {
    socket.join(data.randomRoomCode);
    currentRoomId = data.randomRoomCode;

    db.run(`INSERT INTO rooms (id) VALUES (${data.randomRoomCode})`);
    db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES ("${socket.id}", "${data.name}", 0, ${data.randomRoomCode})`);
    db.run(`INSERT INTO bomb (id,turn,counter,max) VALUES (${data.randomRoomCode}, 0, 0, 10)`);

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
      socket.nsp.to(data.roomCode).emit("receive_users", rows);
      // min - 1, max - users.lenght * 5
      const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
      console.log("Max - ",max);
      turn = Math.round(Math.random() * (rows.length - 1));
      console.log(rows[turn].username);
      db.run(`UPDATE bomb SET max = ${max}, turn = "${rows[turn].username}" WHERE id = ${data.roomCode}`);
    });
  });

  // users get up to date data
  socket.on("joined", async (room) => {
    await db.all(`SELECT * FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
    socket.nsp.to(room).emit("receive_users", rows);
    });
  });

  // how many players are ready
  socket.on("send_value", (data) => {
      socket.nsp.to(data.roomCode).emit("recive_value", data.newPlayersReady);
  });

  // Game 1 - Click The Bomb
  socket.on("send_ctb_counter", (room) => {
    db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = ${room}`);
    db.all(`SELECT max, counter FROM bomb WHERE id = ${room}`, [], (err, rows) => {
      if(rows[0].max == rows[0].counter){
        db.all(`SELECT username FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
          rows.forEach((row) => {
            if(row.username == socket.id){
              socket.nsp.to(room).emit("receive_ctb_turn", row.username);
              return;
            }
          });
        });
      } else {
        db.all(`SELECT counter FROM bomb WHERE id = ${room}`, [], (err, rows) => {
          socket.nsp.to(room).emit("receive_ctb_counter", rows[0].counter);
        });
      }
    });
  });
  socket.on("send_ctb_turn", (room) => {
    db.all(`SELECT username FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
      if(turn == rows.length){
        turn = 0;
      } else {
        turn++;
      }
      console.log("Turn - ",turn);
      console.log(rows[turn].username);
      socket.nsp.to(room).emit("receive_ctb_turn", rows[turn].username);
    })
  });

  // disconnect user
  socket.on("disconnect", () => {
    // data from the user that disconnected
    db.all(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err, rows) => {
      if(!err){
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
        socket.nsp.to(currentRoomId).emit("receive_users", rows);
      }
    });
  });
});


