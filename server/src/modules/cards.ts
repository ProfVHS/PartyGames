import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { Room, User } from '../index';

interface Cards {
    id: number,
    isPositive: boolean,
    score: number
};

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    updateUserScore: (id: string, score: number, socket: Socket) => void,
    roomData: (roomCode: string, socket: Socket) => Promise<Room>,
    updateRoomTime: (roomCode: string, time_left: number, time_max: number) => Promise<void>,
    updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
    changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
) => {
    //#region cards functions
    // arrays with ponts for cards in 3 different turns
    const scoreArrays = async (roomCode: string) => {
        return new Promise<Room>((resolve, reject) => {
            db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
                if(err){
                    console.log("Score Arrays Cards error:");
                    reject(err);
                } else {
                    resolve(room_row);                    
                }
            });
        });
    };
    // generate cards array for actual game
    const generateCards = async (roomCode: string) => {        
        return new Promise<Cards[]>((resolve, reject) => {
            const array: Cards[] = [];

            scoreArrays(roomCode).then(async (row) => {
                return new Promise<[number[], number[]]>((resolve, reject) => {
                    console.log("row.round - ",row.round);
                    switch(row.round){
                        case 1:
                            resolve([ [25,25,50], [50,50,50,100,100,150] ]);
                        case 2:
                            resolve([ [50,75,75,100], [75,75,75,150,225] ]);
                        case 3:
                            resolve([ [100,100,150,150,200], [100,200,200,300] ]);
                        default:
                            reject("Error: wrong round");
                    };
                }).then(([negative, positive]) => {
                    // card id
                    var id = 0;
                    // fill cardsArray with data from bombScore and cardsScore arrays
                    while(array.length < 9){
                        const isPositive = Math.random() < 0.5;
                        if(isPositive){
                            if(positive.length > 0){
                                // get random index from cardsScore and remove it
                                const index = Math.floor(Math.random() * positive.length);
                                const score = positive[index];
                                // decrease positive cards to stop adding them when there are no more needed
                                positive.splice(index, 1);
                                // add positive card
                                array.push({id, isPositive, score });   
                                id++;
                            }
                        } else {
                            if(negative.length > 0){
                                // get random index from bombScore and remove it
                                const index = Math.floor(Math.random() * negative.length);
                                const score = negative[index];
                                // decrease negative cards to stop adding them when there are no more needed
                                negative.splice(index, 1);
                                // add negative card
                                array.push({id, isPositive, score: score });
                                id++;
                            }
                        }
                    }
                    resolve(array);
                });
            });            
        });
    };
    //#endregion

    //#region cards sockets
    // start game cards
    socket.on("startGameCards", async (roomCode: string) => {
        await changeRoomRound(roomCode, socket).then(async () => {
            await roomData(roomCode, socket);
            // generate cards for turn, set time_left to 15 and time_max to 15
            generateCards(roomCode).then((cards: Cards[]) => {
                // send cardsArray to all users in room
                socket.nsp.to(roomCode).emit("receiveCardsArray", cards);
                cards.forEach((card) => {
                    db.run(`INSERT INTO cards (id_card,id_room,isPositive,score) VALUES (${card.id},"${roomCode}", ${card.isPositive}, ${card.score})`);
                });
            });

            updateRoomTime(roomCode, 15, 15);
        });
    });
    // give or take points, depends on card type and number of users who selected this card
    socket.on("checkCard", async (data: {roomCode: string, id: number}) => {
        // get card from cardsArray
        return new Promise<[Cards, User[]]>((resolve, reject) => {
            Promise.all([
                new Promise<Cards>((resolveCards, rejectCards) => {
                    db.get(`SELECT * FROM cards WHERE id_room = "${data.roomCode}" AND id_card = ${data.id}`, [], (err: Error, card_row: Cards) => {
                        if(err){
                            console.log("Cards");
                            rejectCards(err);
                        } else {
                            resolveCards(card_row);
                        }
                    })
                }),
                new Promise<User[]>((resolveUsers, rejectUsers) => {
                    db.all(`SELECT * FROM users WHERE id_room = "${data.roomCode}" AND id_selected = ${data.id}`, [], (err: Error, users_rows: User[]) => {
                        if(err){
                            console.log('Users (Cards) error:');
                            rejectUsers(err);
                        } else {
                            resolveUsers(users_rows);
                        }
                    })
                })
            ]).then(([card_row, users_rows]) => {
                resolve([card_row, users_rows]);
            }).catch((error) => {
                reject(error);
            });
        }).then(([card_row, users_rows]) => {
            users_rows.forEach((user) => {
                if(card_row.isPositive){
                    const score = card_row.score / users_rows.length;
                    updateUserScore(user.id, score, socket);
                } else {
                    const score = -card_row.score * users_rows.length;
                    updateUserScore(user.id, score, socket);
                }
            });
        });
    });
    // end round cards
    socket.on("endRoundCards", async (roomCode: string) => {
        // delete cards from cards table
        db.run(`DELETE FROM cards WHERE id_room = "${roomCode}"`);
    });
    // end game cards
    socket.on("endGameCards",async (roomCode: string) => {
        // delete cards from cards table
        db.run(`DELETE FROM cards WHERE id_room = "${roomCode}"`);
        // update in_game to false, round to 1
        updateRoomRound(roomCode, 0, socket);
        console.log("end game cards");
    });
    //#endregion
};