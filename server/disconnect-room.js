exports = module.exports = function(io){
    io.sockets.on('connection', function(socket) {
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
    })
}