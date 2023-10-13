const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { MongoClient } = require("mongodb");
const { error } = require("console");
require("dotenv").config();

const activeRooms = new Set();

var users;

const app = express();
app.use(cors());

const server = http.createServer(app);

server.listen(3000, async () => {
  console.log("serwer cię słyszy");
  const url = process.env.urldb;
  const client = new MongoClient(url);

  try {
    await client.connect();

    const database = client.db("rooms");
    users = database.collection("users");
  } catch (e) {
    console.log(e);
  }
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("checkRoomExistence", (room) => {
    socket.emit("roomExistenceResponse", activeRooms.has(room) ? true : false);
  });

  socket.on("join-room", async (room, user) => {
    socket.join(room);

    console.log(`user ${user} connected to ${room}`);

    socket.to(room).emit("joined", { user });

    const query = { roomcode: room, users: [user] };
    const userQuery = activeRooms.has(room)
      ? await users.updateOne({ roomcode: room }, { $push: { users: user } })
      : await users.insertOne(query);

    activeRooms.add(room);
  });

  socket.on("joined", async (room) => {
    const data = await users.findOne({ roomcode: room });

    console.log(data);

    socket.nsp.to(room).emit("receive_users", data);
  });
});
