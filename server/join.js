exports = module.exports = function(io, db, usersData){
    io.sockets.on('connection', function (socket) {
      // create room
      socket.on("create-room", async (data) => {
        socket.join(data.randomRoomCode);

        db.run(`INSERT INTO rooms (id,turn,ready) VALUES (${data.randomRoomCode}, 0, 0)`);
        db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name}", 100, true, ${data.randomRoomCode})`);
        db.run(`INSERT INTO bomb (id,counter,max) VALUES (${data.randomRoomCode}, 0, 0)`);
        usersData(data.randomRoomCode, socket);
      });

      // join room
      socket.on("join-room", async (data) => {
        socket.join(data.roomCode);
        db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name}", 100, true, ${data.roomCode})`);
        usersData(data.randomRoomCode, socket);
      });
    }); 
}