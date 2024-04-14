import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";

import { Room, User } from "../index";

type Cards = {
  id: number;
  isPositive: boolean;
  score: number;
};

type CardsArray = {
  roomCode: string;
  cards: Cards[];
};

const cardsArray: CardsArray[] = [];

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  usersResetData: (roomCode: string, socket: Socket) => void,
  updateUserScore: (id: string, score: number, socket: Socket) => void,
  roomData: (roomCode: string, socket: Socket) => Promise<Room>,
  updateRoomTime: (roomCode: string, time_left: number, time_max: number) => Promise<void>,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
  getUsersData: (roomCode: string) => Promise<User[]>
) => {
  //#region cards functions
  // arrays with ponts for cards in 3 different turns
  const scoreArrays = async (roomCode: string) => {
    return new Promise<Room>((resolve, reject) => {
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
        if (err) {
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
          switch (row.round) {
            case 1:
              resolve([
                [25, 25, 50],
                [50, 50, 50, 100, 100, 150],
              ]);
            case 2:
              resolve([
                [50, 75, 75, 100],
                [75, 75, 75, 150, 225],
              ]);
            case 3:
              resolve([
                [100, 100, 150, 150, 200],
                [100, 200, 200, 300],
              ]);
            default:
              reject("Error: wrong round");
          }
        }).then(([negative, positive]) => {
          // card id 
          var id = 0;
          // fill cardsArray with data from bombScore and cardsScore arrays
          while (array.length < 9) {
            const isPositive = Math.random() < 0.5;
            if (isPositive) {
              if (positive.length > 0) {
                // get random index from cardsScore and remove it
                const index = Math.floor(Math.random() * positive.length);
                const score = positive[index];
                // decrease positive cards to stop adding them when there are no more needed
                positive.splice(index, 1);
                // add positive card
                array.push({ id, isPositive, score });
                id++;
              }
            } else {
              if (negative.length > 0) {
                // get random index from bombScore and remove it
                const index = Math.floor(Math.random() * negative.length);
                const score = negative[index];
                // decrease negative cards to stop adding them when there are no more needed
                negative.splice(index, 1);
                // add negative card
                array.push({ id, isPositive, score: score });
                id++;
              }
            }
          }
          cardsArray.push({ roomCode, cards: array });
          resolve(array);
        });
      });
    });
  };
  //#endregion

  // add users to the lowest balance after cards database - for medals
  const addUsersToLowestBalanceDB = async (roomCode: string) => {
    const usersArray = await getUsersData(roomCode);
    return await new Promise<void>((resolve, reject) => {
      usersArray.forEach((user) => {
        db.run(`INSERT INTO lowestBalanceAfterCards (id_user,number) VALUES ("${user.id}",0)`, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve();
    });
  };
  const updateUsersLowestBalance = async (user_id: string, number: number) => {
    return await new Promise<void>((resolve, reject) => {
      db.run(`UPDATE lowestBalanceAfterCards SET number = number + ${number} WHERE id_user = "${user_id}"`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  const getLowestBalance = async () => {
    const usersmostclicks = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM lowestBalanceAfterCards ORDER BY number DESC`, [], (err: Error, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(usersmostclicks);
  };

  socket.on("addUsersToLowestBalance", async (roomCode: string) => {
    await addUsersToLowestBalanceDB(roomCode);
  });

  //#region cards sockets
  // start game cards
  socket.on("startGameCards", async (roomCode: string) => {
    await changeRoomRound(roomCode, socket).then(async () => {
      await roomData(roomCode, socket);

      // generate cards for turn, set time_left to 15 and time_max to 15
      generateCards(roomCode).then((cards: Cards[]) => {
        // send cardsArray to all users in room
        socket.nsp.to(roomCode).emit("receiveCardsArray", cards);
      });

      updateRoomTime(roomCode, 10, 10);
    });
  });
  // gets cards from database
  socket.on("getCards", async (roomCode: string) => {
    const cards = cardsArray.find((cards) => cards.roomCode === roomCode)?.cards;

    socket.emit("receiveCardsArray", cards);
  });
  // give or take points, depends on card type and number of users who selected this card
  socket.on("checkCard", async (data: { roomCode: string; id: number }) => {
    const card = cardsArray.find((cards) => cards.roomCode === data.roomCode)?.cards.find((card) => card.id === data.id);

    const userSelectedCard = await new Promise<User[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM users WHERE id_room = "${data.roomCode}" AND id_selected = ${data.id} AND is_disconnect = false`,
        [],
        (err: Error, users_rows: User[]) => {
          if (err) {
            console.log("Users (Cards) error:");
            reject(err);
          } else {
            resolve(users_rows);
          }
        }
      });
    });

    if (card?.isPositive) {
      userSelectedCard.forEach((user) => {
        const score = card.score / userSelectedCard.length;
        updateUserScore(user.id, score, socket);
        updateUsersLowestBalance(user.id, score).then(() => {
          console.log("get lowest balance");
          getLowestBalance();
        });
      });
    } else if (card?.isPositive === false) {
      userSelectedCard.forEach((user) => {
        const score = -card.score * userSelectedCard.length;
        updateUserScore(user.id, score, socket);
        updateUsersLowestBalance(user.id, score).then(() => {
          console.log("get lowest balance");
          getLowestBalance();
        });
      });
    }
  });
  // end round cards
  socket.on("endRoundCards", async (roomCode: string) => {
    cardsArray.splice(
      cardsArray.findIndex((cards) => cards.roomCode === roomCode),
      1
    );
  });
  // end game cards
  socket.on("endGameCards", async (roomCode: string) => {
    cardsArray.splice(
      cardsArray.findIndex((cards) => cards.roomCode === roomCode),
      1
    );
    // update in_game to false, round to 1
    updateRoomRound(roomCode, 0, socket);
    usersResetData(roomCode, socket);

    socket.nsp.to(roomCode).emit("receiveNextGame");
  });
  //#endregion
};
