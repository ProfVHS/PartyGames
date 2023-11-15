exports = module.exports = function(io, db){
    io.sockets.on('connection', function(socket) {
        // users get up to date data
        socket.on("joined", async (room) => {
            await db.all(`SELECT * FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
            socket.nsp.to(room).emit("receive_users", rows);
            });
        });

        // homepage, check room existence
        socket.on("checkRoomExistence", (room) => {
            db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
            if(!err){
                socket.emit("roomExistenceResponse", row ? true : false);
            }
            });
        });

        // how many players are ready
        socket.on("send_value", async (data) => {
            socket.nsp.to(data.roomCode).emit("recive_value", data.newPlayersReady);
            await db.all(`SELECT * FROM users WHERE id_rooms = ${data.roomCode}`, [], (err, rows) => {
                if(data.newPlayersReady == rows.length){
                  const turn = Math.round(Math.random() * (rows.length - 1));
                  updateRoomTurn(turn,data.roomCode,socket);
                  const username = rows[turn].username;
                  const id = rows[turn].id;

                  socket.nsp.to(data.roomCode).emit("receive_ctb_turn", {username, id});
                  socket.nsp.to(data.roomCode).emit("start_game_ctb", data.roomCode);                  
                }
            });
        });

        // disconnect user
        socket.on("disconnect", () => {
            var currentRoomId;  

            // data from the user that disconnected
            db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err, row) => {
              if(!err){
                currentRoomId = row.id_rooms;
                socket.nsp.to(currentRoomId).emit("user_disconnected", row);
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
}