exports = module.exports = function(io){
    io.sockets.on('connection', function(socket) {
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
    });
}