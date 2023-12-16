import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { User } from '../index';

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    updateRoomTime: (roomCode: string, time_left: number, time_max: number) => void,
    updateRoomInGame: (roomCode: string, in_game: boolean) => void,
) => {
    // arrays with ponts for diamonds in 3 different rounds
    const scoreArrays = async (roomCode: number) => {
        return new Promise<number[]>((resolve, reject) => {
            switch(roomCode){
                case 1:
                    resolve([250,100,35]);
                case 2:
                    resolve([275,125,50]);
                case 3:
                    resolve([300,150,75]);
                default:
                    reject("Error: wrong round");
            };
        });
    };

    // find min value in array without 0
    const findWinners = async (roomCode: string, diamondArray: number[]) => {
        new Promise<User[]>((resolve, reject) => {
            db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, rows: User[]) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }).then((rows) => {
            rows.forEach((row) => {
                if(row.id_selected === 0){
                    diamondArray[0] += 1;
                } else if(row.id_selected === 1){
                    diamondArray[1] += 1;
                } else {
                    diamondArray[2] += 1;
                }
            });
            return new Promise<number>((resolve, reject) => {
                // Filter out 0 values
                const nonZeroValues: number[] = diamondArray.filter(value => value !== 0);
                
                // Find the minimum value
                const minValue: number = Math.min(...nonZeroValues);
                resolve(minValue);
            });
        }).then((minValue) => {
            console.log(minValue);
        });
    }

    // start game tricky diamonds
    socket.on("startGameDiamonds", async (roomCode: string) => {
        scoreArrays(1).then((array) => {
            socket.nsp.to(roomCode).emit("receiveDiamondsScore", array);
        });
        updateRoomTime(roomCode, 5, 5);
        updateRoomInGame(roomCode, true);
    });

    // end round tricky diamonds
    socket.on("endRoundDiamonds", async (roomCode: string) => {
        const diamondArray: number[] = [0,0,0];

        findWinners(roomCode, diamondArray);
    });

    // end game tricky diamonds
    socket.on("endGameDiamonds", async (roomCode: string) => {
        updateRoomInGame(roomCode, false);
    });

};