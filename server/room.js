
exports = module.exports = function(io, db, usersData, roomData, updateRoomTurn, updateDataBomb, disconnectUser){
  io.sockets.on('connection', function(socket) {
    // homepage, check room existence
    socket.on("checkRoomExistence", async (room) => {
      db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
        if(!err){
          socket.emit("roomExistenceResponse", row ? true : false);
        }
      });
    });    
    
    // users get up to date data
    socket.on("joined", async (room) => {
        usersData(room, socket);
        roomData(room, socket); 
    });

    // how many players are ready
    socket.on("send_value", async (data) => {
      db.run(`UPDATE rooms SET ready = ready + ${data.newPlayersReady} WHERE id = ${data.roomCode}`);
      
      roomData(data.roomCode, socket);

      return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM rooms WHERE id = ${data.roomCode}`, [], (err, row) => {
          if(err){
            reject(err);
          } else {
            db.all(`SELECT * FROM users WHERE id_room = ${data.roomCode}`, [], (err, rows) => {
              if (err) {
                  reject(err);
              } else {
                  resolve([row, rows]);
              }
          });
          }
        });
      })
      .then(([row, rows]) => {
        if(row.ready == rows.length){
          const turn = Math.round(Math.random() * (rows.length - 1));
          updateRoomTurn(turn, data.roomCode, socket);

          // min - 1, max - users.lenght * 5 (max number of clicks)
          const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
          updateDataBomb(max,0,data.roomCode);
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
            currentRoomId = row.id_room;
            disconnectUser(currentRoomId, row, socket);
          }
        }
      });
    });
    
  });
};