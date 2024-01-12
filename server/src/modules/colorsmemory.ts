import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';
import { Room, User } from '../index';

type Buttons = {
    room: string,
    buttons: number[],
}

const ButtonsArray: Buttons[] = [];

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
    changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
    updateUserScore: (id: string, score: number, socket: Socket) => Promise<void>,
    updateUserScoreMultiply: (roomCode: string, id: string, score: number, socket: Socket) => Promise<void>,
    updateUserAlive: (id: string ,alive: boolean) => Promise<void>,
    updateUsersAlive: (roomCode: string, alive: boolean) => Promise<void>,
) => {
    //#region colors memory functions
    const addButton = async (roomCode: string) => {
        const randomButton = Math.floor(Math.random() * 8);
        if (!ButtonsArray.find((room) => roomCode === room.room)) {
            ButtonsArray.push({ room: roomCode, buttons: [randomButton] });
            return;
        }
        ButtonsArray.find((room) => roomCode === room.room)?.buttons.push(randomButton);
    };

    const lightButton = async (roomCode: string) => {
        const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;

        if (buttons?.length === 1) {
            socket.nsp.to(roomCode).emit("sequenceColorsMemory", buttons);
        } else {
            socket.nsp.to(socket.id).emit("sequenceColorsMemory", buttons);
        }
    };
    //#endregion
    //#region colors memory sockets
    socket.on("startGameColorsMemory", async (roomCode: string) => {
        await changeRoomRound(roomCode, socket).then(() => {
            addButton(roomCode);
            lightButton(roomCode);
        });
    });

    socket.on("buttonClickedColorsMemory", async (roomCode: string, id: number, currentClickNumber: number) => {
        const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;

        console.log("CurrentClickNumber - ",currentClickNumber);

        if(buttons){
            if(buttons[currentClickNumber] !== id){
                updateUserAlive(socket.id, false);
                socket.nsp.to(socket.id).emit("endGameUserColorsMemory");
                return;
            } else {
                
            }

            const btnsLength = await new Promise<number>((resolve, reject) => {
                db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err: Error, row: User) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve(row.id_selected);
                    }
                });
            });

            if(currentClickNumber == btnsLength){
                // update selected id
                new Promise<[Room, User]>((resolve, reject) => {
                    db.run(`UPDATE users SET id_selected = id_selected + 1 WHERE id = "${socket.id}"`);
                    Promise.all([
                        new Promise<Room>((resolve, reject) => {
                            db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
                                if(err){
                                    reject(err);
                                } else {
                                    resolve(room_row);
                                }
                            });
                        }),
                        new Promise<User>((resolve, reject) => {
                            db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err: Error, user_row: User) => {
                                if(err){
                                    reject(err);
                                } else {
                                    resolve(user_row);
                                }
                            });
                        })
                    ]).then(([room_row, user_row]) => {
                        resolve([room_row, user_row]);
                      }).catch((error) => {
                        reject(error);
                      });
                }).then(async ([room_row, user_row]) => {
                    // if you are the first who end round, update game else only get info
                    console.log("Round - ",room_row.round);
                    console.log("id_selected - ",user_row.id_selected);
                    if(room_row.round == user_row.id_selected){
                        console.log("end round");
                        socket.nsp.to(socket.id).emit("endRoundColorsMemory", );
                    } else {
                        console.log("get info");
                        await lightButton(roomCode);
                    }
                });

            }
        }
    });

    socket.on("endGameColorsMemory", async (roomCode: string) => {
        updateRoomRound(roomCode, 0, socket)
        updateUsersAlive(roomCode, true);
    });
    //#endregion
};