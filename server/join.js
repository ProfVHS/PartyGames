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

        return new Promise((resolve, reject) => {
          db.all(`SELECT * FROM users WHERE id_room = ${data.roomCode}`, [], (err, users_rows) => {
            if(err) {
                reject(err);
            } else {
              db.all(`SELECT COUNT(*) AS "count" FROM users WHERE id_room = ${data.roomCode} AND username IN ( "${data.name}", "${data.name} (1)", "${data.name} (2)", "${data.name} (3)", "${data.name} (4)", "${data.name} (5)", "${data.name} (6)" )`, [], (err, count_row) => {
                if(err) {
                  reject(err);
                } else {
                  resolve([users_rows, count_row]);
                };
              });
            }
          });
        }).then(([users_rows, count_row]) => {
          if(users_rows.length < 8){
            socket.emit("roomNotFull");
            console.log(count_row[0].count);
            if(count_row[0].count == 0){
              db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name}", 100, true, ${data.roomCode})`);
            } else {
              db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name} (${count_row[0].count})", 100, true, ${data.roomCode})`);
            }

            usersData(data.randomRoomCode, socket); 
          }
        });
      });
    }); 
}