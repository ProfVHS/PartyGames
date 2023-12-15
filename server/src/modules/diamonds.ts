import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
) => {

    socket.on("startGameDiamonds", async (id_room: string) => {

    });

    socket.on("endGameDiamonds", async (id_room: string) => {
        
    });

};