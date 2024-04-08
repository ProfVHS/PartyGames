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
  usersResetData: (roomCode: string, socket: Socket) => void,
  usersData: (roomCode: string, socket: Socket) => Promise<void>,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
  updateUserAlive: (id: string, alive: boolean) => Promise<void>,
  updateUsersAlive: (roomCode: string, alive: boolean) => Promise<void>
) => {
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
  //#endregion
  //#region colors memory sockets
  socket.on("startGameColorsMemory", async (roomCode: string) => {
    await changeRoomRound(roomCode, socket).then(() => {
      addButton(roomCode);
      lightButton(roomCode);
    });
  });

  socket.on("buttonClickedColorsMemory", async (roomCode: string, id: number, currentClickNumber: number) => {
    const buttons = ButtonsArray.find((room) => roomCode === room.room)?.buttons;

    if (buttons) {
      // End User Game
      if (buttons[currentClickNumber] !== id) {
        updateUserAlive(socket.id, false);
        socket.nsp.to(socket.id).emit("endGameUserColorsMemory");

        const usersAlive = await new Promise<number>((resolve, reject) => {
          db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = 1`, [], (err: Error, rows: User[]) => {
            if (err) {
              console.log("Users Alive (colors end game) Error");
              reject(err);
            } else {
              resolve(rows.length);
            }
          });
        });

        db.run(`UPDATE users SET position = ${usersAlive + 1} WHERE id = "${socket.id}"`);

        // End Game
        if (usersAlive == 1) {
          type UserPosition = { username: string; scoreToAdd: number | null; record: number };

          const usersPosition = await new Promise<UserPosition[]>((resolve, reject) => {
            db.all(`SELECT username, score AS scoreToAdd, id_selected AS record FROM users WHERE id_room = "${roomCode}" ORDER BY position`, [], (err: Error, row: UserPosition[]) => {
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

          // db.run(`UPDATE users SET score = score + 100 WHERE id_room = "${roomCode}" AND position = 1`);
          // db.run(`UPDATE users SET score = score + 50 WHERE id_room = "${roomCode}" AND position = 2`);
          socket.nsp.to(roomCode).emit("endGameColorsMemory", usersPosition);
          //socket.nsp.to(roomCode).emit("receiveNextGame");
          usersData(roomCode, socket);
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

  socket.on("endGameColorsMemory", async (roomCode: string) => {
    updateRoomRound(roomCode, 0, socket);
    usersResetData(roomCode, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");
  });
  //#endregion
};
