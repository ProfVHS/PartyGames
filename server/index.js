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

//const Join = require("./join-room")(io);
//const Disconnect = require("./disconnect-room")(io);
//const Update = require("./update-room")(io);

const updateDataBomb = (max,counter,room) => {
  db.run(`UPDATE bomb SET max = ${max}, counter = ${counter} WHERE id = ${room}`);
};
const updateRoomTurn = (turn,room) => {
  db.run(`UPDATE rooms SET turn = ${turn} WHERE id = ${room}`);
};

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

    db.run(`INSERT INTO rooms (id,turn) VALUES (${data.randomRoomCode}, 0)`);
    db.run(`INSERT INTO users (id,username,score,alive,id_rooms) VALUES ("${socket.id}", "${data.name}", 0, true, ${data.randomRoomCode})`);
    db.run(`INSERT INTO bomb (id,counter,max) VALUES (${data.randomRoomCode}, 0, 0)`);

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

    db.run(`INSERT INTO users (id,username,score,alive,id_rooms) VALUES ("${socket.id}", "${data.name}", 0, true, ${data.roomCode})`);

    db.all(`SELECT * FROM users WHERE id_rooms = ${data.roomCode}`, (err, rows) => {
      socket.nsp.to(data.roomCode).emit("receive_users", rows);
      // min - 1, max - users.lenght * 5 (max number of clicks)
      const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
      const turn = Math.round(Math.random() * (rows.length - 1));
      updateDataBomb(max,0,data.roomCode);
      updateRoomTurn(turn,data.roomCode);
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
    db.all(`SELECT max, counter FROM bomb WHERE id = ${room}`, [], (err, bomb_rows) => {
      // if max number of clicks is reached
      if(bomb_rows[0].max == bomb_rows[0].counter){
        db.all(`SELECT id,username FROM users WHERE id_rooms = ${room} AND alive = 1`, [], (err, rows) => {
          rows.forEach((row) => {
            // update user as dead and set new max number of clicks
            if(row.id == socket.id){
              updateAliveUsers();
              const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
              updateDataBomb(max,0,room);
              socket.nsp.to(room).emit("receive_ctb_counter", 0);
              socket.nsp.to(room).emit("receive_ctb_death", row.id);
              return;
            }
          });
          // if there are only 2 players left, end the game, reset alive users
          if(rows.length == 2){
            db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, u_rows) => {
              socket.nsp.to(room).emit("receive_ctb_end", rows[0].username);
              console.log(u_rows);
            });
          } 
        });
      } 
      // if max number of clicks is not reached, continue the game
      else {
        db.all(`SELECT counter FROM bomb WHERE id = ${room}`, [], (err, rows) => {
          socket.nsp.to(room).emit("receive_ctb_counter", rows[0].counter);
        });
      }
    });
  });

  // set user as dead
  const updateAliveUsers = () => {
    db.run(`UPDATE users SET alive = false WHERE id = "${socket.id}"`);
  };

  socket.on("send_change_ctb_turn", (room) => {
    db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = 1`, [], (err, rows) => {
      db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
        if(!err){
          if((rows.length-1) == row.turn){
            updateRoomTurn(0,room);
          } else {
            const turn = row.turn + 1;
            updateRoomTurn(turn,room);
          }
          db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row2) => {
            if(!err){
              const turn = row2.turn;
              const username = rows[turn].username;
              const id = rows[turn].id;
              socket.nsp.to(room).emit("receive_ctb_turn", {username, id} );
            };
          });
        }
      });
    });
  });

  socket.on("send_ctb_turn", (room) => {
    db.all(`SELECT id, username FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
      db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
        if(!err){
          const turn = row.turn;
          const username = rows[turn].username;
          const id = rows[turn].id;
          socket.nsp.to(room).emit("receive_ctb_turn", {username, id} );
        }
      });
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