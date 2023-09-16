const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const cors = require("cors") 

const app = express()
app.use(cors())

const server = http.createServer(app) 
const io = new Server(server, {
    cors: {origin: "http://localhost:5173"}
})

io.on('connection', (socket) => {
    socket.on("join-room", (room) => {
        socket.join(room)
        console.log(`user ${socket.id} connected to ${data}`);
    })
})

server.listen(3000, () => {
    console.log('serwer cię słyszy')
});

