import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { Room } from '../index';

interface Cards {
    isPositive: boolean,
    score: number
};

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    usersData: (room: string, socket: Socket) => void,
    updateUserScore: (id: string, score: number) => void,
    updateRoomInGame: (room: string, in_game: boolean) => void,
    updateRoomTime: (room: string, time_left: number, time_max: number) => void,
) => {
    // arrays with ponts for cards in 3 different turns
    const scoreArrays = (bombs: number) => {
        let bombScore: number[];
        let cardsScore: number[];
        
        // first turn (3 bombs, 6 cards)
        if(bombs == 3){
            bombScore = [25,25,50];
            cardsScore = [50,50,50,100,100,150];
        } 
        // second turn (4 bombs, 5 cards)
        else if (bombs == 4){
            bombScore = [50,75,75,100];
            cardsScore = [75,75,75,150,225];
        }
        // third turn (5 bombs, 4 cards)
        else {
            bombScore = [100,100,150,150,200];
            cardsScore = [100,200,200,300];
        }

        return { bombScore, cardsScore };
    };

    // generate cards array for actual game
    const generateCards = (room: string, socket: Socket, bombs: number, cards: number) => {
        const cardsArray: Cards[] = [];
        // check if there are too many cards by mistake
        if(bombs + cards > 9) return console.log("Error: too many cards");

        const { bombScore, cardsScore } = scoreArrays(bombs);

        // fill cardsArray with data from bombScore and cardsScore arrays
        while(cardsArray.length < 9){
            const isPositive = Math.random() < 0.5;
            if(isPositive){
                if(cards > 0){
                    // get random index from cardsScore and remove it
                    const index = Math.floor(Math.random() * cardsScore.length);
                    const score = cardsScore[index];
                    cardsScore.splice(index, 1);
                    // add positive card
                    cardsArray.push({ isPositive, score });
                    // decrease cards counter to stop adding cards when there are no more cards needed
                    cards--;
                }
            } else {
                if(bombs > 0){
                    // get random index from bombScore and remove it
                    const index = Math.floor(Math.random() * bombScore.length);
                    const score = bombScore[index];
                    bombScore.splice(index, 1);
                    // add negative card
                    cardsArray.push({ isPositive, score: score });
                    // decrease bombs counter to stop adding bombs when there are no more bombs needed
                    bombs--;
                }
            }
        }

        // send cardsArray to all users in room
        socket.nsp.to(room).emit("receiveCardsArray", cardsArray);
    };

    socket.on("startGameCards", (data: {roomCode: string, bombs_value: number, cards_value: number}) => {
        // generate cards for turn, set time_left to 15 and time_max to 15
        generateCards(data.roomCode, socket, data.bombs_value, data.cards_value);
        updateRoomTime(data.roomCode, 15, 15);
        updateRoomInGame(data.roomCode, true);
    });


    socket.on("timeCards", async (room) => {
        // set interval to decrease time_left every second
        const cardsTimeInterval = setInterval( async () => {
            db.run(`UPDATE rooms SET time_left = time_left - 1 WHERE id = ${room}`);

            return new Promise<Room>((resolve, reject) => {
                db.get(`SELECT * FROM rooms WHERE id = ${room}`, [], (err: Error, row: Room) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            }).then((row) => {
                row.time_left >= 0 ? socket.nsp.to(room).emit("receiveTimeCards", row.time_left) : clearInterval(cardsTimeInterval);
            });
        }, 1000);
    });

    socket.on("pointsCards", (data: { roomCode: string, selectedCard: number, cards: Cards[] }) => {
        console.log(data.selectedCard);
        console.log(data.cards);

        socket.nsp.to(data.roomCode).emit("receivePointsCards", {selectedCard: data.selectedCard, id: socket.id});
    });

    socket.on("endGameCards", (room: string) => {
        // update in_game to false, alive to true, turn to 0
        updateRoomInGame(room, false);
    });
};

// end the game - update in_game to false, alive to true, turn to 0