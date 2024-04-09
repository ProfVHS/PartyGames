import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";

import { User, Room } from "../index";

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  updateUserScore: (id: string, score: number, socket: Socket) => void,
  updateRoomTime: (roomCode: string, time_left: number, time_max: number) => void,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
  getUsersData: (roomCode: string) => Promise<User[]>
) => {
  // add users to the lowest balance after cards database - for medals
  const addUsersToSamotnyWilkDB = async (roomCode: string) => {
    const usersArray = await getUsersData(roomCode);
    return await new Promise<void>((resolve, reject) => {
      usersArray.forEach((user) => {
        db.run(`INSERT INTO samotnyWilk (id_user,number) VALUES ("${user.id}",0)`, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve();
    });
  };
  const updateUsersSamotnyWilk = async (user_id: string, number: number) => {
    return await new Promise<void>((resolve, reject) => {
      db.run(`UPDATE samotnyWilk SET number = number + ${number} WHERE id_user = "${user_id}"`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  const getSamotnyWilk = async () => {
    const users = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM samotnyWilk ORDER BY number DESC`, [], (err: Error, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(users);
  };

  socket.on("addUsersToLowestBalance", async (roomCode: string) => {
    await addUsersToSamotnyWilkDB(roomCode);
  });

  //#region diamonds functions
  // arrays with ponts for diamonds in 3 different rounds
  const scoreArrays = async (roomCode: string) => {
    return new Promise<Room>((resolveRoom, rejectRoom) => {
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
        if (err) {
          rejectRoom("Error: Score arrays");
        } else {
          resolveRoom(room_row);
        }
      });
    }).then((room_row) => {
      return new Promise<number[]>((resolve, reject) => {
        switch (room_row.round) {
          case 1:
            resolve([250, 100, 35]);
            break;
          case 2:
            resolve([275, 125, 50]);
            break;
          case 3:
            resolve([300, 150, 75]);
            break;
          default:
            endGameDiamonds(roomCode);
            break;
        }
      });
    });
  };

  // find min value in array without 0
  const findWinners = async (roomCode: string, diamondArray: number[]) => {
    return new Promise<User[]>((resolveUsers, rejectUsers) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, rows: User[]) => {
        if (err) {
          rejectUsers(err);
        } else {
          resolveUsers(rows);
        }
      });
    }).then((rows) => {
      rows.forEach((row) => {
        if (row.id_selected === 0) {
          diamondArray[0] += 1;
        } else if (row.id_selected === 1) {
          diamondArray[1] += 1;
        } else {
          diamondArray[2] += 1;
        }
      });
      return new Promise<number>((resolve, reject) => {
        console.log("diamondArray - ", diamondArray);

        // Filter out 0 values
        const nonZeroDiamondArray: number[] = diamondArray.filter((value) => value !== 0);

        // Find the minimum value and check if it's unique
        const min = Math.min(...nonZeroDiamondArray);
        const isUnique = diamondArray.indexOf(min) === diamondArray.lastIndexOf(min);
        const index = diamondArray.indexOf(min);

        if (nonZeroDiamondArray.length > 1) {
          if (isUnique) {
            scoreArrays(roomCode).then((array) => {
              rows.forEach((row) => {
                if (row.id_selected === diamondArray.indexOf(min)) {
                  updateUserScore(row.id, array[index], socket);
                  updateUsersSamotnyWilk(row.id, 1);
                }
              });
            });
          }
        }
      });
    });
  };

  const endGameDiamonds = async (roomCode: string) => {
    updateRoomRound(roomCode, 0, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");
    console.log("endGameDiamonds");
  };
  //#endregion

  //#region diamonds sockets
  // start game tricky diamonds
  socket.on("startGameDiamonds", async (roomCode: string) => {
    await changeRoomRound(roomCode, socket).then(() => {
      scoreArrays(roomCode).then((array) => {
        console.log(array);
        socket.nsp.to(roomCode).emit("receiveDiamondsScore", array);
        updateRoomTime(roomCode, 5, 5);
      });
      addUsersToSamotnyWilkDB(roomCode);
    });
  });

  // end round tricky diamonds
  socket.on("endRoundDiamonds", async (roomCode: string) => {
    findWinners(roomCode, [0, 0, 0]);
  });

  // end game tricky diamonds
  // socket.on("endGameDiamonds", async (roomCode: string) => {
  //     updateRoomInGame(roomCode, false);
  //     updateRoomRound(roomCode, 0, socket);
  //     console.log("endGameDiamonds");
  // });
  //#endregion
};
