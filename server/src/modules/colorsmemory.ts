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
  getUsersData: (roomCode: string) => Promise<User[]>
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

  socket.on("InitColorsMemory", async (roomCode: string) => {
    await addUsersToColorsMemoryRoundRecordDB(roomCode);
  });

  //#endregion
  //#region colors memory sockets
  socket.on("startGameColorsMemory", async (roomCode: string) => {
    await changeRoomRound(roomCode, socket).then(() => {
      addButton(roomCode);
      lightButton(roomCode);
      db.run(`UPDATE rooms SET in_game = true WHERE id = "${roomCode}"`);
    });
  });

  socket.on("buttonClickedColorsMemory", async (roomCode: string, id: number, currentClickNumber: number) => {
    const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;

    console.log("CurrentClickNumber - ", currentClickNumber);
    updateUsersColorsMemoryRoundRecord(socket.id, currentClickNumber).then(() => {
      console.log("get color memory round record");
      getColorsMemoryRoundRecord();
    });

    if (buttons) {
      if (buttons[currentClickNumber] !== id) {
        updateUserAlive(socket.id, false);
        socket.nsp.to(socket.id).emit("endGameUserColorsMemory");

        const usersAlive = await new Promise<number>((resolve, reject) => {
          db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = 0`, [], (err: Error, rows: User[]) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows.length);
            }
          });
        });

        db.run(`UPDATE users SET position = ${usersAlive + 1} WHERE id = "${socket.id}"`);

        console.log("usersAlive - ", usersAlive);

        if (usersAlive == 1) {
          db.run(`UPDATE users SET score = score + 100 WHERE id_room = "${roomCode}" AND position = 1`);
          usersData(roomCode, socket);
          socket.nsp.to(roomCode).emit("endGameColorsMemory");
          socket.nsp.to(roomCode).emit("receiveNextGame");
        }
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

      console.log("btnsLength - ", buttons_array_length);

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

        console.log("room_round - ", room_round);

        const user_round = await new Promise<number>((resolve, reject) => {
          db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err: Error, row: User) => {
            if (err) {
              reject(err);
            } else {
              resolve(row.id_selected);
            }
          });
        });

        console.log("user_round - ", user_round);

        if (room_round == user_round) {
          console.log("end round");
          socket.nsp.to(socket.id).emit("endRoundColorsMemory");
        } else {
          console.log("get info");
          await lightButton(roomCode);
        }
      }
    }
  });

  socket.on("endGameColorsMemory", async (roomCode: string) => {
    updateRoomRound(roomCode, 0, socket);
    updateUsersAlive(roomCode, true);
    socket.nsp.to(roomCode).emit("receiveNextGame");
  });
  //#endregion
};
