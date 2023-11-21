exports = module.exports = function(io, db, usersData, updateRoomTurn, updateDataBomb, disconnectUser){
  io.sockets.on('connection', function(socket) {
        // users get up to date data
        socket.on("joined", async (room) => {
            usersData(room, socket);

            return new Promise((resolve, reject) => {
              db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, turn_row) => {
                if(err){
                  reject(err);  
                } else {
                  resolve(turn_row);
                }
              });
            })
            .then((turn_row) => {
              socket.nsp.to(room).emit("receive_value", turn_row.ready);
            });
        });

        // homepage, check room existence
        socket.on("checkRoomExistence", async (room) => {
          db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
            if(!err){
              socket.emit("roomExistenceResponse", row ? true : false);
            }
          });
        });

        // how many players are ready
        socket.on("send_value", async (data) => {
          return new Promise((resolve, reject) => {
            db.run(`UPDATE rooms SET ready = ${data.newPlayersReady} WHERE id = ${data.roomCode}`);

            db.get(`SELECT * FROM rooms WHERE id = ${data.roomCode}`, [], (err, ready_row) => {
              if(err){
                reject(err);  
              } else {
                db.all(`SELECT * FROM users WHERE id_room = ${data.roomCode}`, [], (err, users_rows) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve([ready_row, users_rows]);
                  }
                }); 
              }
            });
          })
          .then(([read_row, users_rows]) => {
            socket.nsp.to(data.roomCode).emit("receive_value", read_row.ready);

            if(data.newPlayersReady == users_rows.length){
              const turn = Math.round(Math.random() * (users_rows.length - 1));
              updateRoomTurn(turn, data.roomCode, socket);
              const username = users_rows[turn].username;
              const id = users_rows[turn].id;
              
              // min - 1, max - users.lenght * 5 (max number of clicks)
              const max = Math.round(Math.random() * ((users_rows.length * 5) - 1)) + 1;
              updateDataBomb(max,0, data.roomCode, socket);

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