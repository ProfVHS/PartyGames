import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    usersData: (room: string, socket: Socket) => void, 
    roomData: (room: string, socket: Socket) => void
) => {
    const updateDataBomb = (max: number, counter: number, room: string) => {
        db.run(`INSERT INTO bomb (id,counter,max) VALUES (${room},${counter},${max})`);
        console.log("max: " + max);
    };

    // socket.on("startGameCtb", (room: string, users: []) => {
    //     // min - 1, max - users.lenght * 5 (max number of clicks)
    //     console.log("users_lenght: " + users);
    //     console.log("room: " + room);
    //     // const max = Math.round(Math.random() * ((users_lenght * 5) - 1)) + 1;
    //     // updateDataBomb(max,0,room);
    // });
};