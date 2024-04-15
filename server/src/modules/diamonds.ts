import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";

import { User, Room } from "../index";

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  roomData: (roomCode: string, socket: Socket) => void,
  updateUserScore: (id: string, score: number, socket: Socket) => void,
  updateRoomTime: (roomCode: string, time_left: number, time_max: number) => void,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
  getUsersData: (roomCode: string) => Promise<User[]>,
  usersResetData: (roomCode: string, socket: Socket) => void
) => {
  // add users to database
  const addUsersToFiguredOutDb = async (roomCode: string) => {
    const usersArray = await getUsersData(roomCode);
    return await new Promise<void>((resolve, reject) => {
      usersArray.forEach((user) => {
        db.run(`INSERT INTO figuredOutDiamonds (id_user,number) VALUES ("${user.id}",0)`, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve();
    });
  };
  const updateUserFiguredOut = async (user_id: string, number: number) => {
    return await new Promise<void>((resolve, reject) => {
      db.run(`UPDATE figuredOutDiamonds SET number = number + ${number} WHERE id_user = "${user_id}"`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  const getFiguredOut = async () => {
    const users = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM figuredOutDiamonds ORDER BY number DESC`, [], (err: Error, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(users);
  };

  socket.on("addUsersToFiguredOutDiamondsDb", async (roomCode: string) => {
    await addUsersToFiguredOutDb(roomCode);
  });

  //#region diamonds functions
  // arrays with ponts for diamonds in 3 different rounds
  const scoreArrays = async (roomCode: string) => {
    const round = await new Promise<number>((resolveRoom, rejectRoom) => {
      db.get(`SELECT round FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
        if (err) {
          console.log("Diamonds Score arrays error:");
          rejectRoom(err);
        } else {
          resolveRoom(row.round);
        }
      });
    });

    console.log(round);
    return await new Promise<number[]>((resolve, reject) => {
      switch (round) {
        case 0:
          resolve([250, 100, 35]);
          break;
        case 1:
          resolve([275, 125, 50]);
          break;
        case 2:
          resolve([300, 150, 75]);
          break;
        default:
          endGameDiamonds(roomCode);
          break;
      }
    });
  };

  // find min value in array without 0
  const findWinners = async (roomCode: string, diamondArray: number[]) => {
    return new Promise<User[]>((resolveUsers, rejectUsers) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND is_disconnect = false AND alive = true`, [], (err: Error, rows: User[]) => {
        if (err) {
          rejectUsers(err);
        } else {
          resolveUsers(rows);
        }
      });
    }).then((rows) => {
      rows.forEach((row) => {
        diamondArray[row.id_selected] += 1;
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
                  updateUserFiguredOut(row.id, 1).then(() => {
                    console.log("Samotny Wilk");
                    getFiguredOut();
                  });
                }
              });
            });
          }
        }
      });
    });
  };

  const endGameDiamonds = async (roomCode: string) => {
    await updateRoomRound(roomCode, 0, socket);
    usersResetData(roomCode, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");
    console.log("endGameDiamonds");
  };
  //#endregion

  //#region diamonds sockets
  // start game tricky diamonds
  socket.on("startGameDiamonds", async (roomCode: string) => {
      await scoreArrays(roomCode).then((array) => {
        console.log(array);
        socket.nsp.to(roomCode).emit("receiveDiamondsScore", array);
        updateRoomTime(roomCode, 10, 10);
        // is minigame started
        roomData(roomCode, socket);
      });
  });

  socket.on("getDiamondsScore", async (roomCode: string) => {
    scoreArrays(roomCode).then((array) => {
      console.log(array);
      socket.nsp.to(roomCode).emit("receiveDiamondsScore", array);
    });
  });

  // end round tricky diamonds
  socket.on("endRoundDiamonds", async (roomCode: string) => {
    console.log("endRoundDiamonds");
    await changeRoomRound(roomCode, socket);
    findWinners(roomCode, [0, 0, 0]);
  });
  //#endregion
};
