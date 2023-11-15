exports = module.exports = function(io, db){
    io.sockets.on('connection', function(socket) {
        // users get up to date data
        socket.on("joined", async (room) => {
            await db.all(`SELECT * FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
            socket.nsp.to(room).emit("receive_users", rows);
            });
        });
    });
}