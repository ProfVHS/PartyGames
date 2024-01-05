import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

const ButtonsArray: number[] = [];

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
    changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
) => {
    //#region colors memory functions
    const addButton = async (roomCode: string) => {
        const randomButton = Math.floor(Math.random() * 8);
        console.log(randomButton);
        ButtonsArray.push(randomButton);
    };

    const lightButton = async (roomCode: string) => {
        console.log(ButtonsArray);
        socket.nsp.to(roomCode).emit("endRoundColorsMemory", ButtonsArray);
    };
    //#endregion
    //#region colors memory sockets
    socket.on("startGameColorsMemory", async (roomCode: string) => {
        await changeRoomRound(roomCode, socket).then(() => {
            addButton(roomCode);
            lightButton(roomCode);
        });
    });

    socket.on("endGameColorsMemory", async (roomCode: string) => {
        updateRoomRound(roomCode, 0, socket)
    });
    //#endregion
};