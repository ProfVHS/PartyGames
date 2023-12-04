import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { User } from '../index';

interface Bomb {
    id: number,
    counter: number,
    max: number
};

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    usersData: (room: string, socket: Socket) => void, 
    updateRoomTurn: (room: string, turn: number, socket: Socket) => Promise<void>,
    changeRoomTurn: (room: string, socket: Socket) => Promise<void>,
    updateUserScore: (id: string, score: number) => void,
    updateUserScoreMultiply: (id: string, score: number) => void,
    updateUserAlive: (id: string, alive: boolean) => void,
    updateUsersAlive: (room: string, alive: boolean) => void,
    updateRoomInGame: (room: string, in_game: boolean) => void,
) => {
    const updateDataBomb = (max: number, counter: number, room: string) => {
        db.run(`INSERT or IGNORE INTO bomb (id,counter,max) VALUES (${room},${counter},${max})`);
    };

    socket.on("startGameCtb", (data: { roomCode: string, usersLength: number}) => {
        // (generate max number of clicks) min - 1, max - users.lenght * 5
        const max = Math.round(Math.random() * ((data.usersLength * 5) - 1)) + 1;
        // (generate turn) min - 0, max - users.lenght - 1
        const turn = Math.round(Math.random() * (data.usersLength - 1));
        updateRoomTurn(data.roomCode,turn,socket);
        updateDataBomb(max,0,data.roomCode);
        updateRoomInGame(data.roomCode,true);
    });

    // send turn to the next player
    socket.on("changeTurnCtb", (room: string) => {
        changeRoomTurn(room, socket);
    });

    // counter + 1 and check whtat's happen
    // if counter !== max, add 1 to counter and continue the game
    // if counter === max, user lose (explode) or if 2 players left end the game
    socket.on("counterCtb", async (room: string) => {
        db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = "${room}"`);

        return new Promise<[Bomb, User[]]>((resolve, reject) => {
            Promise.all([
                new Promise<Bomb>((resolveBomb, rejectBomb) => {
                    db.get(`SELECT * FROM bomb WHERE id = "${room}"`, [], (err: Error, bomb_row: Bomb) => {
                        if (err) {
                            rejectBomb(err);
                        } else {
                            resolveBomb(bomb_row);
                        }
                    });
                }),
                new Promise<User[]>((resolveUsers, rejectUsers) => {
                    db.all(`SELECT * FROM users WHERE id_room = "${room}" AND alive = true`, [], (err: Error, users_rows: User[]) => {
                        if (err) {
                            rejectUsers(err);
                        } else {
                            resolveUsers(users_rows);
                        }
                    });
                }),
            ]).then(([bomb_row, users_rows]) => {
                resolve([bomb_row, users_rows]);
            }).catch((error) => {
                reject(error);
            });
        }).then(([bomb_row, users_rows]) => {
            // bomb explode
            if(bomb_row.counter == bomb_row.max){
                // end the game
                if(users_rows.length == 2){
                    users_rows.forEach((user) => {
                        // -30% points to the user
                        if( user.id == socket.id ){
                            updateUserScoreMultiply(user.id, 0.7);
                        } else {
                            updateUserScore(user.id, 50);
                        }
                    });
                    // update in game to false 
                    updateRoomInGame(room, false);
                    // update alive users to true
                    updateUsersAlive(room, true);
                    // send data to the client
                    usersData(room, socket);
                    socket.nsp.to(room).emit("receiveEndCtb");
                } else {
                    // user explode
                    // update new max number of clicks and reset counter
                    const max = Math.round(Math.random() * (((users_rows.length - 1) * 5) - 1)) + 1;
                    updateDataBomb(max,0,room);
                    // update turn
                    changeRoomTurn(room, socket);
                    // update user as dead
                    updateUserAlive(socket.id, false);
                    // -30% points to the user
                    updateUserScoreMultiply(socket.id, 0.7);
                    // send data to the client
                    usersData(room, socket);
                    socket.nsp.to(room).emit("receiveCounterCtb", bomb_row.counter);
                    socket.nsp.to(room).emit("receiveExplosionCtb", socket.id);
                }
            } else {
                // continue the game, +10 points to the user
                socket.nsp.to(room).emit("receiveCounterCtb", bomb_row.counter);    
                updateUserScore(socket.id, 10);
                usersData(room, socket);
            }
        });
    });
};