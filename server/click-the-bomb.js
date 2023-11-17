exports = module.exports = function(io, db, updateDataBomb, changeRoomTurn, updateAliveUser, updateAliveUsers){
    io.sockets.on('connection', function(socket) {
        // Game 1 - Click The Bomb
        socket.on("start_game_ctb", (roomCode) => {
            // min - 1, max - users.lenght * 5 (max number of clicks)
            const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
            updateDataBomb(max,0,roomCode);
            console.log("max: " + max);
        });

        // increase counter        
        socket.on("send_ctb_counter", async (room) => {
            await db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = ${room}`);
            
            await db.get(`SELECT * FROM bomb WHERE id = ${room}`, [], (err, row) => {
                if(!err){
                    if(row.counter == row.max){
                        db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows) => {
                            if(rows.length == 2){
                                db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, users_rows) => {
                                    users_rows.forEach(user_row => {
                                        if(user_row.id != socket.id){
                                            socket.nsp.to(room).emit("receive_ctb_end", user_row.username);
                                        }
                                    });
                                });
                                updateAliveUsers(true,room);
                            } else {
                                db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, users_rows) => {
                                    users_rows.forEach(async user_row => {
                                        if(user_row.id == socket.id){
                                            // update turn 
                                            await changeRoomTurn(room,socket);
                                            // update new max number of clicks and reset counter
                                            const max = Math.round(Math.random() * ((users_rows.length * 5) - 1)) + 1;
                                            updateDataBomb(max,0,room);
                                            // update user as dead
                                            updateAliveUser(false,socket.id);
                                        }
                                    });
                                });
                                // send info to the client
                                socket.nsp.to(room).emit("receive_ctb_counter", 0);
                                socket.nsp.to(room).emit("receive_ctb_death", socket.id);
                            }
                        });                        
                    } else {
                        // continue the game
                        socket.nsp.to(room).emit("receive_ctb_counter", row.counter);
                    }
                }
            });
        });

        // send turn to the next player
        socket.on("send_change_ctb_turn", (room) => {
            changeRoomTurn(room,socket);
        });
    });
};