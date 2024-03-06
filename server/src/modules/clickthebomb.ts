import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { User } from '../index';

interface Bomb {
    id: string,
    counter: number,
    max: number
};

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    usersData: (roomCode: string, socket: Socket) => void, 
    updateRoomTurn: (roomCode: string, turn: number, socket: Socket) => Promise<void>,
    changeRoomTurn: (roomCode: string, socket: Socket) => Promise<void>,
    updateUserScore: (id: string, score: number, socket: Socket) => void,
    updateUserScoreMultiply: (roomCode: string, id: string, score: number, socket: Socket) => void,
    updateUserAlive: (id: string, alive: boolean) => void,
    updateUsersAlive: (roomCode: string, alive: boolean) => void,
) => {
    //#region ctb functions
    // set data bomb
    const setDataBomb = async (max: number, counter: number, roomCode: string) => {
        return new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO bomb (id,counter,max) VALUES ("${roomCode}",${counter},${max})`, (err) => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
    // update data bomb (max, counter)
    const updateDataBomb = async (max: number, counter: number, roomCode: string) => {
        return new Promise<void>((resolve, reject) => {
            db.run(`UPDATE bomb SET max = ${max}, counter = ${counter} WHERE id = "${roomCode}"`, (err) => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
    // increment counter by 1
    const incrementCounter = async (roomCode: string) => {
        return new Promise<void>((resolve, reject) => {
            db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = "${roomCode}"`, (err) => {
                if(err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
    //#endregion

    //#region ctb sockets
    // start the game click the bomb
    socket.on("startGameCtb", (data: { roomCode: string, usersLength: number}) => {
        // (generate max number of clicks) min - 1, max - users.lenght * 5
        const max = Math.round(Math.random() * ((data.usersLength * 5) - 1)) + 1;
        // (generate turn) min - 0, max - users.lenght - 1
        const turn = Math.round(Math.random() * ((data.usersLength * 1) - 1));
        updateRoomTurn(data.roomCode,turn,socket);
        setDataBomb(max,0,data.roomCode);
    });

    // send turn to the next player
    socket.on("changeTurnCtb", (roomCode: string) => {
        changeRoomTurn(roomCode, socket);
    });

    // counter + 1 and check whtat's happen
    // if counter !== max, add 1 to counter and continue the game
    // if counter === max, user lose (explode) or if 2 players left end the game
    socket.on("counterCtb", async (roomCode: string) => {
        
        incrementCounter(roomCode).then(async () => {
            const bombData = await new Promise<Bomb>((resolveBomb, rejectBomb) => {
                db.get(`SELECT * FROM bomb WHERE id = "${roomCode}"`, [], (err: Error, bomb_row: Bomb) => {
                    if (err) {
                        rejectBomb(err);
                    } else {
                        resolveBomb(bomb_row);
                    }
                });
            });
            const usersArray = await new Promise<User[]>((resolveUsers, rejectUsers) => {
                db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = true AND isDisconnect = false`, [], (err: Error, users_rows: User[]) => {
                    if (err) {
                        rejectUsers(err);
                    } else {
                        resolveUsers(users_rows);
                    }
                });
            });

            // bomb explode
            if(bombData.counter == bombData.max){
                // end the game
                if(usersArray.length == 2){
                    usersArray.forEach((user) => {
                        // -30% points to the user
                        if( user.id == socket.id ){
                            updateUserScoreMultiply(roomCode, user.id, 0.7, socket);
                        } else {
                            updateUserScore(user.id, 50, socket);
                        }
                    });
                    // update alive users to true
                    updateUsersAlive(roomCode, true);
                    // send data to the client
                    usersData(roomCode, socket);
                    socket.nsp.to(roomCode).emit("receiveEndCtb");
                } else {
                    // user explode
                    // update new max number of clicks and reset counter
                    const max = Math.round(Math.random() * (((usersArray.length - 1) * 5) - 1)) + 1;
                    await updateDataBomb(max,0,roomCode).then(async () => {
                        // update user as dead
                        updateUserAlive(socket.id, false);
                    }).then(async () => {
                        // update turn
                        await changeRoomTurn(roomCode, socket);
                    }).then(() => {
                        // -30% points to the user
                        updateUserScoreMultiply(roomCode, socket.id, 0.7, socket);
                    }).then(() => {
                        // send data to the client
                        usersData(roomCode, socket);
                        socket.nsp.to(roomCode).emit("receiveCounterCtb", 0);
                        socket.nsp.to(roomCode).emit("receiveExplosionCtb", socket.id);
                    });
                }
            } else {
                // continue the game, +10 points to the user
                socket.nsp.to(roomCode).emit("receiveCounterCtb", bombData.counter);    
                updateUserScore(socket.id, 10, socket);
                usersData(roomCode, socket);
            }

        });
    });
    //#endregion
};