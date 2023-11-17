exports = module.exports = function(io, db, updateRoomTurn, updateDataBomb, disconnectUser){
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
                  updateRoomTurn(turn, data.roomCode, socket);
                  const username = rows[turn].username;
                  const id = rows[turn].id;
                  // min - 1, max - users.lenght * 5 (max number of clicks)
                  const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
                  updateDataBomb(max,0, data.roomCode, socket);
                  console.log("max: " + max);
                  socket.nsp.to(data.roomCode).emit("receive_ctb_turn", {username, id});
                  
                }
            });
        });

        // disconnect user
        socket.on("disconnect", async () => {
            var currentRoomId;  

            // data from the user that disconnected
            await db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err, row) => {
              if(!err){
                if(row){
                  currentRoomId = row.id_rooms;
                  disconnectUser(currentRoomId, row, socket);
                }
              }
            });
        });
    });
};