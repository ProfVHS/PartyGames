import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { Room } from '../index';

interface Cards {
    id: number,
    isPositive: boolean,
    score: number
};

interface selectedCards {
    user_id: string,
    selectedCard: number
};

interface arraySelectedCards {
    id_room: string,
    cards: selectedCards[]
};

const selectedCardsArray: arraySelectedCards[] = [];

module.exports = (
    io: Server, 
    socket: Socket, 
    db: Database, 
    usersData: (room: string, socket: Socket) => void,
    updateUserScore: (id: string, score: number, socket: Socket) => void,
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
    const generateCards = async (room: string, socket: Socket, bombs: number, cards: number) => {        
        return new Promise<Cards[]>((resolve, reject) => {
            const array: Cards[] = [];
            // check if there are too many cards by mistake
            if(bombs + cards > 9) return reject("Error: too many cards");

            const { bombScore, cardsScore } = scoreArrays(bombs);

            var id = 0;
            // fill cardsArray with data from bombScore and cardsScore arrays
            while(array.length < 9){
                const isPositive = Math.random() < 0.5;
                if(isPositive){
                    if(cards > 0){
                        // get random index from cardsScore and remove it
                        const index = Math.floor(Math.random() * cardsScore.length);
                        const score = cardsScore[index];
                        cardsScore.splice(index, 1);
                        // add positive card
                        array.push({id, isPositive, score });   
                        // decrease cards counter to stop adding cards when there are no more cards needed
                        cards--;
                        id++;
                    }
                } else {
                    if(bombs > 0){
                        // get random index from bombScore and remove it
                        const index = Math.floor(Math.random() * bombScore.length);
                        const score = bombScore[index];
                        bombScore.splice(index, 1);
                        // add negative card
                        array.push({id, isPositive, score: score });
                        // decrease bombs counter to stop adding bombs when there are no more bombs needed
                        bombs--;
                        id++;
                    }
                }
            }
            resolve(array);
        });
    };

    socket.on("startGameCards", (data: {roomCode: string, bombs_value: number, cards_value: number}) => {
        // generate cards for turn, set time_left to 15 and time_max to 15
        generateCards(data.roomCode, socket, data.bombs_value, data.cards_value).then((cards: Cards[]) => {
            // send cardsArray to all users in room
            socket.nsp.to(data.roomCode).emit("receiveCardsArray", cards);
            cards.forEach((card) => {
                db.run(`INSERT INTO cards (id_card,id_room,isPositive,score) VALUES (${card.id},${data.roomCode}, ${card.isPositive}, ${card.score})`);
            });
        });
        updateRoomTime(data.roomCode, 5, 5);
        updateRoomInGame(data.roomCode, true);
    });


    socket.on("timeCards", async (room: string) => {
        // set interval to decrease time_left every second
        const cardsTimeInterval = setInterval( async () => {
            db.run(`UPDATE rooms SET time_left = time_left - 1 WHERE id = ${room}`);
            // send time_left to all users in room
            return new Promise<Room>((resolve, reject) => {
                db.get(`SELECT * FROM rooms WHERE id = "${room}"`, [], (err: Error, row: Room) => {
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

    socket.on("selectedCards", (data: { roomCode: string, selectedCard: number }) => {
        if(selectedCardsArray.find((element) => element.id_room == data.roomCode) == undefined){
            selectedCardsArray.push({id_room: data.roomCode, cards: [{user_id: socket.id, selectedCard: data.selectedCard}]});
        } else{
            selectedCardsArray.find((element) => element.id_room == data.roomCode)?.cards.push({user_id: socket.id, selectedCard: data.selectedCard});
        }
    });

    // 
    socket.on("checkCard", async (data: {room: string, id: number}) => {
        // get card from cardsArray
        return new Promise<Cards>((resolve, reject) => {
            db.get(`SELECT * FROM cards WHERE id_room = ${data.room} AND id_card = ${data.id}`, [], (err: Error, row: Cards) => {
                if(err){
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        }).then((row) => {
            const selectedCard = selectedCardsArray.find((room) => room.id_room == data.room)?.cards.filter((card) => card.selectedCard == data.id);
            const usersLenght = selectedCard?.length;
            
            selectedCardsArray.find((room) => room.id_room == data.room)?.cards.filter((card) => card.selectedCard == data.id).forEach((user) => {
                if(row.isPositive){
                    const score = row.score / usersLenght!;
                    updateUserScore(user.user_id, score, socket);
                } else {
                    const score = -row.score * usersLenght!;
                    updateUserScore(user.user_id, score, socket);
                }
            });
        });
    });

    socket.on("endGameCards", async (room: string) => {
        // delete cards from cards table
        selectedCardsArray.splice(selectedCardsArray.findIndex((element) => element.id_room == room), 1);
        db.run(`DELETE FROM cards WHERE id_room = ${room}`);
        // update in_game to false, alive to true, turn to 0
        updateRoomInGame(room, false);
    });
};