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
        console.log(buttons);
        socket.nsp.to(roomCode).emit("sequenceColorsMemory", buttons);
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
        console.log("current - ", currentClickNumber);
        const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;
        console.log("buttons - ",buttons);

        if(buttons){
            if(buttons[currentClickNumber] !== id){
                console.log("incorrect");
                updateUserAlive(socket.id, false);
                // update Score to do
                socket.nsp.to(socket.id).emit("endGameUserColorsMemory");
                return;
            } else {
                console.log("correct");
                // update Score to do
                
            }

            // end round
            if(currentClickNumber === buttons.length-1){
                console.log("end round");
                // end round
                socket.nsp.to(roomCode).emit("endRoundColorsMemory", );
                return;
            }
        }
    });

    socket.on("endGameColorsMemory", async (roomCode: string) => {
        updateRoomRound(roomCode, 0, socket)
        updateUsersAlive(roomCode, true);
    });
    //#endregion
};