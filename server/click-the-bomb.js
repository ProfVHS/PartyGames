exports = module.exports = function(io, db, updateDataBomb, updateRoomTurn, changeRoomTurn, updateAliveUsers){
    io.sockets.on('connection', function(socket) {
        // Game 1 - Click The Bomb
        socket.on("start_game_ctb", (roomCode) => {
            // min - 1, max - users.lenght * 5 (max number of clicks)
            const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
            updateDataBomb(max,0,roomCode);
            console.log("max: " + max);
        });

        // increase counter        
        socket.on("send_ctb_counter", (room) => {
            db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = ${room}`);
            db.all(`SELECT max, counter FROM bomb WHERE id = ${room}`, [], (err, bomb_rows) => {
            // if max number of clicks is reached
            if(bomb_rows[0].max == bomb_rows[0].counter){
                db.all(`SELECT id,username FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
                    if(!err){
                        rows.forEach(row => {
                            if(row.id == socket.id){
                                // update turn 
                                db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows2) => {
                                    db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row2) => {
                                        if(!err){
                                            if((rows2.length-1) == row2.turn) {
                                                updateRoomTurn(0,room,socket);
                                                const username = rows2[0].username;
                                                const id = rows2[0].id;
                                                socket.nsp.to(room).emit("receive_ctb_turn", { username, id });
                                            } else {
                                                const turn = row2.turn + 1;
                                                updateRoomTurn(turn,room,socket);
                                                const username = rows2[turn].username;
                                                const id = rows2[turn].id;
                                                socket.nsp.to(room).emit("receive_ctb_turn", { username, id });
                                            }
                                        };  
                                    });
                                });
                                // update user as dead
                                updateAliveUsers(row.id);
                                // update new max number of clicks
                                const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
                                updateDataBomb(max,0,room);
                                // send info to the client
                                socket.nsp.to(room).emit("receive_ctb_counter", 0);
                                socket.nsp.to(room).emit("receive_ctb_death", row.id);
                            }
                        });
                    };
                // if there are only 2 players left, end the game, reset alive users
                if(rows.length == 2){
                    db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, u_rows) => {
                    socket.nsp.to(room).emit("receive_ctb_end", u_rows[0].username);
                    });
                } 
                });
            } 
            // if max number of clicks is not reached, continue the game
            else {
                db.all(`SELECT counter FROM bomb WHERE id = ${room}`, [], (err, rows) => {
                socket.nsp.to(room).emit("receive_ctb_counter", rows[0].counter);
                });
            }
            });
        });

        // send turn to the next player
        socket.on("send_change_ctb_turn", (room) => {
            changeRoomTurn(room,socket);
        });
    });
}

// db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row2) => {
                        //     if(!err){
                        //         const turn = row2.turn;
                        //         db.all(`SELECT id, username FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows2) => {
                        //             if(!err){
                        //             const username = rows2[turn].username;
                        //             const id = rows2[turn].id;
                        //             socket.nsp.to(room).emit("receive_ctb_turn", {username, id} );             
                        //             }
                        //         });
                        //     };
                        // });