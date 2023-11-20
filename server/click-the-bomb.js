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
            
            db.get(`SELECT * FROM bomb WHERE id = ${room}`, [], (err, row) => {
                if(!err){
                    if(row.counter == row.max){
                        db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, rows) => {});
                        // update turn
                        // set user as dead
                        // update new max number of clicks and reset counter
                        
                    } else {
                        // continue the game
                        console.log("counter: " + row.counter);
                    }
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


                        // db.all(`SELECT max, counter FROM bomb WHERE id = ${room}`, [], (err, bomb_rows) => {
                        //     // if max number of clicks is reached
                        //     if(bomb_rows[0].max == bomb_rows[0].counter){
                        //         db.all(`SELECT id,username FROM users WHERE id_rooms = ${room}`, [], (err, rows) => {
                        //             if(!err){
                        //                 rows.forEach(row => {
                        //                     if(row.id == socket.id){
                        //                         // update turn 
                        //                         changeRoomTurn(room,socket);
                        //                         // update user as dead
                        //                         updateAliveUsers(row.id);
                        //                         // update new max number of clicks and reset counter
                        //                         const max = Math.round(Math.random() * ((rows.length * 5) - 1)) + 1;
                        //                         updateDataBomb(max,0,room);
                        //                         // send info to the client
                        //                         socket.nsp.to(room).emit("receive_ctb_counter", 0);
                        //                         socket.nsp.to(room).emit("receive_ctb_death", row.id);
                        //                     }
                        //                 });
                        //             };
                        //         // if there are only 2 players left, end the game, reset alive users
                        //         if(rows.length == 2){
                        //             db.all(`SELECT * FROM users WHERE id_rooms = ${room} AND alive = true`, [], (err, u_rows) => {
                        //                 u_rows.forEach(u_row => {
                        //                     if(u_row.id != socket.id){
                        //                         socket.nsp.to(room).emit("receive_ctb_end", u_rows.username);
                        //                     }
                        //                 });
                        //             });
                        //         } 
                        //         });
                        //     } 
                        //     // if max number of clicks is not reached, continue the game
                        //     else {
                        //         db.all(`SELECT counter FROM bomb WHERE id = ${room}`, [], (err, rows) => {
                        //             socket.nsp.to(room).emit("receive_ctb_counter", rows[0].counter);
                        //         });
                        //     }
                        //     });