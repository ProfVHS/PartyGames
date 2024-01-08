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
) => {
    //#region colors memory functions
    const updateUserButtonsLenght = async (roomCode: string) => {
        const room_row: Room = await new Promise<Room>((resolve, reject) => {
            db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        console.log(room_row.round);
        db.run(`UPDATE users SET id_selected = ${room_row.round-1} WHERE id_room = "${roomCode}"`, [], (err: Error) => {
            if (err) {
                console.log(err);
            }
        });
    };

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
        console.log(buttons);
        socket.nsp.to(roomCode).emit("endRoundColorsMemory", buttons);
    };
    //#endregion
    //#region colors memory sockets
    socket.on("startGameColorsMemory", async (roomCode: string) => {
        await changeRoomRound(roomCode, socket).then(() => {
            updateUserButtonsLenght(roomCode);
            addButton(roomCode);
            lightButton(roomCode);
        });
    });

    socket.on("buttonClickedColorsMemory", async (roomCode: string, id: number) => {
        const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;
        const user_row: User = await new Promise<User>((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, row: User) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        if(user_row.id_selected < 0){
            console.log("end round");
            // end round
            return;
        }
        if(buttons){
            if(buttons[user_row.id_selected] !== id){
                console.log("incorrect");
                // endgame
                return;
            }
            console.log("correct");
            // check next button

            db.run(`UPDATE users SET id_selected = ${user_row.id_selected-1} WHERE id = "${socket.id}"`, [], (err: Error) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

    socket.on("endGameColorsMemory", async (roomCode: string) => {
        updateRoomRound(roomCode, 0, socket)
    });
    //#endregion
};