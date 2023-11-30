import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import sqlite3 from "sqlite3";

const roomModule = require("./modules/room");

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
      'CREATE TABLE rooms ("id" INTEGER NOT NULL PRIMARY KEY, "turn" INTEGER NOT NULL, "ready" INTEGER NOT NULL, "time_left" INTEGER NOT NULL, "time_max" INTEGER NOT NULL);'
    );
    db.run(
      'CREATE TABLE users ("id" VARCHAR(255) NOT NULL PRIMARY KEY, "username" VARCHAR(255), "score" INTEGER NOT NULL, "alive" BOOLEAN NOT NULL, "id_room" INTEGER NOT NULL, FOREIGN KEY ("id_room") REFERENCES rooms ("id"));'
    );
    // games table
    db.run(
      'CREATE TABLE bomb ("id" INTEGER NOT NULL PRIMARY KEY, "counter" VARCHAR(255) NOT NULL, "max" INTEGER NOT NULL, FOREIGN KEY ("id") REFERENCES room ("id"));'
    );
  });

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  const usersData = (room: string, socket: Socket) => {
    db.all(`SELECT * FROM users WHERE id_room = ${room}`, [], (err, rows) => {
      if (!err) {
        console.log(rows);
      }
    });
  };

  const handleModulesOnConnection = (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    roomModule(io, socket, usersData);
  };

  io.on("connection", handleModulesOnConnection);
});
