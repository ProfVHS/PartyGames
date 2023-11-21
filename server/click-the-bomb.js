exports = module.exports = function(io, db, usersData, updateDataBomb, changeRoomTurn, updateAliveUser, updateAliveUsers, updateScore, updateScoreMultiply){
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

            return new Promise((resolve, reject) => {
                db.get(`SELECT * FROM bomb WHERE id = ${room}`, [], (err, row_bomb) => {
                    if(err){
                        reject(err);
                    } else {
                        db.all(`SELECT * FROM users WHERE id_room = ${room} AND alive = true`, [], (err, users_rows) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve([row_bomb, users_rows]);
                            }
                        });
                    }
                });
            })
            .then(([row_bomb, users_rows]) => {
                // max clicks => death
                if (row_bomb.counter == row_bomb.max) {
                    if(users_rows.length == 2){
                        users_rows.forEach(user_row => {
                            if(user_row.id != socket.id){
                                // +50 points to the winner
                                updateScore(50, user_row.id);
                                usersData(room, socket);
                                socket.nsp.to(room).emit("receive_ctb_end", user_row.username);
                            } else {
                                // -30% points to the loser
                                updateScoreMultiply(0.7, user_row.id);
                                usersData(room, socket);
                            }
                        });
                        updateAliveUsers(true,room);
                    } else {
                        // update new max number of clicks and reset counter
                        const max = Math.round(Math.random() * ((10 * 5) - 1)) + 1;
                        updateDataBomb(max,0,room);
                        //update turn 
                        changeRoomTurn(room,socket);
                        // update user as dead
                        updateAliveUser(false,socket.id);
                        // -30% points to the loser
                        updateScoreMultiply(0.7,socket.id);
                        // send info to the client
                        usersData(room, socket);
                        socket.nsp.to(room).emit("receive_ctb_counter", 0);
                        socket.nsp.to(room).emit("receive_ctb_death", socket.id);
                    }
                } else {
                    // Continue the game, +10 points to the user
                    socket.nsp.to(room).emit("receive_ctb_counter", row_bomb.counter);
                    updateScore(10, socket.id);
                    usersData(room, socket);
                }
            })
            .catch((err) => {
                console.error("Error in send_ctb_counter:", err);
            });
        });

        // send turn to the next player
        socket.on("send_change_ctb_turn", (room) => {
            changeRoomTurn(room,socket);
        });
    });
}
