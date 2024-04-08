import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";

import { User, Room } from "../index";

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  usersResetData: (roomCode: string, socket: Socket) => void,
  roomData: (roomCode: string, socket: Socket) => void,
  updateUserScore: (id: string, score: number, socket: Socket) => void,
  updateRoomTime: (roomCode: string, time_left: number, time_max: number) => void,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
) => {
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
          console.log("End");
          //endGameDiamonds(roomCode);
          break;
      }
    });
    
  };

  // find min value in array without 0
  const findWinners = async (roomCode: string, diamondArray: number[]) => {
    return new Promise<User[]>((resolveUsers, rejectUsers) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND is_disconnect = false`, [], (err: Error, rows: User[]) => {
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
    usersResetData(roomCode, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");
    console.log("endGameDiamonds");
  };
  //#endregion

  //#region diamonds sockets
  // start game tricky diamonds
  socket.on("startGameDiamonds", async (roomCode: string) => {
    await changeRoomRound(roomCode, socket).then(async () => {
      await scoreArrays(roomCode).then((array) => {
        console.log(array);
        socket.nsp.to(roomCode).emit("receiveDiamondsScore", array);
        updateRoomTime(roomCode, 10, 10);
        // is minigame started
        roomData(roomCode, socket);
      });
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
    findWinners(roomCode, [0, 0, 0]);
  });

  // end game tricky diamonds
  // socket.on("endGameDiamonds", async (roomCode: string) => {
  //     updateRoomRound(roomCode, 0, socket);
  //     console.log("endGameDiamonds");
  // });
  //#endregion
};
