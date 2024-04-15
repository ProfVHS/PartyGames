import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";
import { Room, User } from "../index";

type Buttons = {
  room: string;
  buttons: number[];
};

const ButtonsArray: Buttons[] = [];

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  usersData: (roomCode: string, socket: Socket) => Promise<void>,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
  updateUserAlive: (id: string, alive: boolean) => Promise<void>,
  updateUsersAlive: (roomCode: string, alive: boolean) => Promise<void>,
  getUsersData: (roomCode: string) => Promise<User[]>,
  usersResetData: (roomCode: string, socket: Socket) => void
) => {
  const addUsersToColorsMemoryRoundRecordDB = async (roomCode: string) => {
    const usersArray = await getUsersData(roomCode);
    return await new Promise<void>((resolve, reject) => {
      usersArray.forEach((user) => {
        db.run(`INSERT INTO colorsMemoryRoundRecord (id_user,number) VALUES ("${user.id}",0)`, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve();
    });
  };
  const updateUsersColorsMemoryRoundRecord = async (user_id: string, number: number) => {
    return await new Promise<void>((resolve, reject) => {
      db.run(`UPDATE colorsMemoryRoundRecord SET number = ${number} WHERE id_user = "${user_id}"`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  const getColorsMemoryRoundRecord = async () => {
    const users = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM colorsMemoryRoundRecord ORDER BY number DESC`, [], (err: Error, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(users);
  };

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

    if (buttons?.length === 1) {
      socket.nsp.to(roomCode).emit("sequenceColorsMemory", buttons);
    } else {
      socket.nsp.to(socket.id).emit("sequenceColorsMemory", buttons);
    }
  };

  const endGame = async (roomCode: string) => {
    console.log("End Game Colors Memory");
    type UserPosition = { username: string; scoreToAdd: number | null; record: number };

    const usersPosition = await new Promise<UserPosition[]>((resolve, reject) => {
      db.all(`SELECT username, score AS scoreToAdd, id_selected AS record FROM users WHERE id_room = "${roomCode}" ORDER BY game_position`, [], (err: Error, row: UserPosition[]) => {
        if (err) {
          console.log("Users Position (colors end game) Error");
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    usersPosition.forEach((user, index) => {
      switch (index) {
        case 0:
          usersPosition[index].scoreToAdd = 100;
          break;
        case 1:
          usersPosition[index].scoreToAdd = 70;
          break;
        case 2:
          usersPosition[index].scoreToAdd = 40;
          break;
        default:
          usersPosition[index].scoreToAdd = 10;
          break;
      }
    });

    console.log("Users Position: ", usersPosition);

    db.run(`UPDATE users SET score = score + 100 WHERE id_room = "${roomCode}" AND game_position = 1`);
    db.run(`UPDATE users SET score = score + 70 WHERE id_room = "${roomCode}" AND game_position = 2`);
    db.run(`UPDATE users SET score = score + 40 WHERE id_room = "${roomCode}" AND game_position = 3`);
    db.run(`UPDATE users SET score = score + 10 WHERE id_room = "${roomCode}" AND game_position > 3`);

    socket.nsp.to(roomCode).emit("endGameUserColorsMemory");
    socket.nsp.to(roomCode).emit("receiveLeaderboardGameUsers", usersPosition);

    await updateRoomRound(roomCode, 0, socket);
    usersResetData(roomCode, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");

    usersData(roomCode, socket);
  };

  socket.on("InitColorsMemory", async (roomCode: string) => {
    await addUsersToColorsMemoryRoundRecordDB(roomCode);
  });

  //#endregion
  //#region colors memory sockets
  socket.on("startGameColorsMemory", async (roomCode: string) => {
    await changeRoomRound(roomCode, socket).then(() => {
      addButton(roomCode);
      lightButton(roomCode);
    });
  });

  socket.on("buttonClickedColorsMemory", async (roomCode: string, id: number, currentClickNumber: number) => {
    console.log("buttonClickedColorsMemory", roomCode, id, currentClickNumber);

    const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;

    updateUsersColorsMemoryRoundRecord(socket.id, currentClickNumber).then(() => {
      getColorsMemoryRoundRecord();
    });

    if (buttons) {
      // End User Game
      if (buttons[currentClickNumber] !== id) {
        console.log("End Game User Colors Memory");
        await updateUserAlive(socket.id, false).then(async () => {
          socket.nsp.to(socket.id).emit("endGameUserColorsMemory");

          const usersAlive = await new Promise<number>((resolve, reject) => {
            db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = true`, [], (err: Error, rows: User[]) => {
              if (err) {
                console.log("Users Alive (colors end game) Error");
                reject(err);
              } else {
                resolve(rows.length);
              }
            });
          });

          db.run(`UPDATE users SET game_position = ${usersAlive + 1} WHERE id = "${socket.id}"`);

          console.log("Users Alive: ", usersAlive);
          // End Game
          if (usersAlive == 1) {
            endGame(roomCode);
          }
        });
        return;
      }

      const buttons_array_length = await new Promise<number>((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err: Error, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.id_selected);
          }
        });
      });

      if (currentClickNumber == buttons_array_length) {
        db.run(`UPDATE users SET id_selected = id_selected + 1 WHERE id = "${socket.id}"`);

        const room_round = await new Promise<number>((resolve, reject) => {
          db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
            if (err) {
              reject(err);
            } else {
              resolve(row.round);
            }
          });
        });

        const user_round = await new Promise<number>((resolve, reject) => {
          db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err: Error, row: User) => {
            if (err) {
              reject(err);
            } else {
              resolve(row.id_selected);
            }
          });
        });

        if (room_round == user_round) {
          socket.nsp.to(socket.id).emit("endRoundColorsMemory");
        } else {
          await lightButton(roomCode);
        }
      }
    }
  });
  //#endregion
};
