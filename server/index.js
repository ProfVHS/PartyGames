const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const cors = require("cors") 
const activeRooms = new Set();

const app = express()
app.use(cors())

const server = http.createServer(app) 
const io = new Server(server, {
    cors: {origin: "http://localhost:5173"}
})

io.on('connection', (socket) => {
    socket.on("checkRoomExistence", (room) => {
        socket.emit("roomExistenceResponse", activeRooms.has(room) ? true : false);
    })
    socket.on("join-room", (room, user) => {
        socket.join(room);
        activeRooms.add(room);
        console.log(`user ${user} connected to ${room}`);
    })
    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        activeRooms.delete(room);
    })
})

server.listen(3000, () => {
    console.log('serwer cię słyszy');
});

