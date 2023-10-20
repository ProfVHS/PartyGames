exports = module.exports = function(io){
    io.sockets.on('connection', function (socket) {
        // create room
        socket.on("create-room", async (data) => {
            socket.join(data.randomRoomCode);
            currentRoomId = data.randomRoomCode;
        
            db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES ("${socket.id}", "${data.username}", 0, ${data.randomRoomCode})`);
          
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
        
            db.run(`INSERT INTO users (id,username,score,id_rooms) VALUES ("${socket.id}", "${data.username}", 0, ${data.roomCode})`);
          
            db.all(`SELECT * FROM users WHERE id_rooms = ${data.roomCode}`, [], (err, rows) => {
              if(!err){
                rows.forEach((row) => {row});
                socket.nsp.to(data.roomCode).emit("receive_users", rows);
              }
            });
          });
    }); 
}