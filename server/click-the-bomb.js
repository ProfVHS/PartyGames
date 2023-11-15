exports = module.exports = function(io, db, updateDataBomb, updateRoomTurn, updateAliveUsers){
    io.sockets.on('connection', function(socket) {
        // Game 1 - Click The Bomb
        socket.on("start_game_ctb", (roomCode) => {
            // min - 1, max - users.lenght * 5 (max number of clicks)
            const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
            updateDataBomb(max,0,roomCode);
        });
        
        socket.on("send_ctb_counter", (room) => {
            db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = ${room}`);
            db.all(`SELECT max, counter FROM bomb WHERE id = ${room}`, [], (err, bomb_rows) => {
            // if max number of clicks is reached
            if(bomb_rows[0].max == bomb_rows[0].counter){
                db.all(`SELECT id,username FROM users WHERE id_rooms = ${room} AND alive = 1`, [], (err, rows) => {
                rows.forEach((row) => {
                    // update user as dead and set new max number of clicks
                    if(row.id == socket.id){
                    updateAliveUsers(socket);
                    const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
                    updateDataBomb(max,0,room);
                    socket.nsp.to(room).emit("receive_ctb_counter", 0);
                    socket.nsp.to(room).emit("receive_ctb_death", row.id);
                    return;
                    }
                });
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
            db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows) => {
            db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row) => {
                if(!err){
                if((rows.length-1) == row.turn){
                    updateRoomTurn(0,room,socket);
                } else {
                    const turn = row.turn + 1;
                    updateRoomTurn(turn,room,socket);
                }

                db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err, row2) => {
                    if(!err){
                    const turn = row2.turn;
                    db.all(`SELECT id, username FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows2) => {
                        if(!err){
                        const username = rows2[turn].username;
                        const id = rows2[turn].id;
                        socket.nsp.to(room).emit("receive_ctb_turn", {username, id} );             
                        }
                    });
                    };
                });
                };  
            });
            });
        });
    });
}