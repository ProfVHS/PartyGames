import { Server, Socket } from 'socket.io';
import { Database } from 'sqlite3';

import { Room } from '../index';

interface Cards {
    isPositive: boolean,
    score: number
};

interface selectedCards {
    user_id: string,
    selectedCard: number
};

interface arraySelectedCards {
    id_room: string,
    array_cards: selectedCards[]
};

const selectedCardsArray: arraySelectedCards[] = [];

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
        updateRoomTime(data.roomCode, 5, 5);
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

    const pp = async (array: {id: string, score: number}[]) => {
        array.forEach(async (element) => {
            await updateUserScore(element.id, element.score);
        });
    };

    const checkSelectedCards = async (room: string, cards: Cards[]) => {
        // check if there are users who selected same card
        const selectedArray = selectedCardsArray.find((element) => element.id_room == room);
        const ScoreUsers: {id: string, score: number}[] = [];
        // cards = [{isPositive: true, score: 50}, {isPositive: false, score: 100}, ...]
        // selectedArray = [{user_id: "socket.id", selectedCard: 0}, {user_id: "socket.id", selectedCard: 1}, ...]
        
        // if there are, send doubled points to the users
        if(selectedArray){
            for(let i = 0; i < 9; i++){
                const penaltyUsers = selectedArray.array_cards.filter((element) => element.selectedCard == i);
                console.log(penaltyUsers);
                if(cards[i].isPositive && penaltyUsers.length > 0){
                    // if card is positive, add points to users who selected it
                    const score: number = cards[i].score / penaltyUsers.length;
                    console.log(score);
                    penaltyUsers.forEach(async (element) => {
                        ScoreUsers.push({id: element.user_id, score: score});
                    });
                } else if(penaltyUsers.length > 0) {
                    // if card is negative, multiply points to users who selected it
                    const score: number = -cards[i].score * penaltyUsers.length;
                    console.log(score);
                    penaltyUsers.forEach(async (element) => {
                        ScoreUsers.push({id: element.user_id, score: score});
                    });
                }
            }
        }
        
        pp(ScoreUsers);
    };

    socket.on("selectedCards", (data: { roomCode: string, selectedCard: number }) => {
        if(selectedCardsArray.find((element) => element.id_room == data.roomCode) == undefined){
            selectedCardsArray.push({id_room: data.roomCode, array_cards: [{user_id: socket.id, selectedCard: data.selectedCard}]});
        } else{
            selectedCardsArray.find((element) => element.id_room == data.roomCode)?.array_cards.push({user_id: socket.id, selectedCard: data.selectedCard});
        }
    });

    socket.on("endGameCards", async (data: {roomCode: string, cards: Cards[]}) => {
        await checkSelectedCards(data.roomCode, data.cards);

        usersData(data.roomCode, socket);

        // clear selectedCardsArray
        selectedCardsArray.splice(selectedCardsArray.findIndex((element) => element.id_room == data.roomCode), 1);

        // update in_game to false, alive to true, turn to 0
        updateRoomInGame(data.roomCode, false);
    });
};