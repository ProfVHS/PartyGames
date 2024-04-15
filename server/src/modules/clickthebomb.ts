import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";

import { User, Room } from "../index";

interface Bomb {
  id: string;
  counter: number;
  max: number;
}

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  usersData: (roomCode: string, socket: Socket) => void,
  getUsersData: (roomCode: string) => Promise<User[]>,
  updateRoomTurn: (roomCode: string, turn: number, socket: Socket) => Promise<void>,
  changeRoomTurn: (roomCode: string, socket: Socket) => Promise<void>,
  updateUserScore: (id: string, score: number, socket: Socket) => void,
  updateUserScoreMultiply: (roomCode: string, id: string, score: number, socket: Socket) => void,
  updateUserAlive: (id: string, alive: boolean) => void,
  updateUsersAlive: (roomCode: string, alive: boolean) => void,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  usersResetData: (roomCode: string, socket: Socket) => void
) => {
  //#region ctb functions
  // set data bomb
  const setDataBomb = async (max: number, counter: number, roomCode: string) => {
    console.log(max, counter, roomCode);
    return new Promise<void>((resolve, reject) => {
      db.run(`INSERT INTO bomb (id,counter,max) VALUES ("${roomCode}",${counter},${max})`, (err) => {
        if (err) {
          console.log("SET DATA bomb error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  // update data bomb (max, counter)
  const updateDataBomb = async (max: number, counter: number, roomCode: string) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE bomb SET max = ${max}, counter = ${counter} WHERE id = "${roomCode}"`, (err) => {
        if (err) {
          console.log("UPDATE DATA bomb error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // add users to the most clicks database - for medals
  const addUserstoMostClicks = async (roomCode: string) => {
    const usersArray = await getUsersData(roomCode);
    return new Promise<void>((resolve, reject) => {
      usersArray.forEach((user) => {
        db.run(`INSERT INTO clickTheBombClicks (id_user,number) VALUES ("${user.id}",0)`, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve();
    });
  };
  const updateUsersMostClicks = async (roomCode: string, user_id: string, number: number) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE clickTheBombClicks SET number = ${number} WHERE id_user = "${user_id}" AND number < ${number}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const getUsersMostClicks = async () => {
    const userMostClicks = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM clickTheBombClicks ORDER BY number DESC`, [], (err: Error, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(userMostClicks);
  };

  // increment counter by 1
  const incrementCounter = async (roomCode: string) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE bomb SET counter = counter + 1 WHERE id = "${roomCode}"`, (err) => {
        if (err) {
          console.log("INCREMENT bomb error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  socket.on("addClickForUser", (roomCode: string, user_id: string, number: number) => {
    updateUsersMostClicks(roomCode, user_id, number).then(() => {
      console.log("Added click for user");
      getUsersMostClicks();
    });
  });

  //#endregion

  //#region ctb sockets
  // start the game click the bomb
  socket.on("startGameCtb", async (data: { roomCode: string; usersLength: number }) => {
    const isGameStarted = await new Promise<Bomb>((resolve, reject) => {
      db.get(`SELECT * FROM bomb WHERE id = "${data.roomCode}"`, [], (err: Error, bomb_row: Bomb) => {
        if (err) {
          console.log("Start CTB In Room error");
          reject(err);
        } else {
          resolve(bomb_row);
        }
      });
    });

    if (!isGameStarted) {
      // (generate max number of clicks) min - 1, max - users.lenght * 5
      const max = Math.round(Math.random() * (data.usersLength * 5 - 1)) + 1;
      // (generate turn) min - 0, max - users.lenght - 1
      const turn = Math.round(Math.random() * (data.usersLength * 1 - 1));
      console.log("Turn - ", turn);
      updateRoomTurn(data.roomCode, turn, socket);
      addUserstoMostClicks(data.roomCode);
      setDataBomb(max, 0, `${data.roomCode}`);
    }
  });

  // send turn to the next player
  socket.on("changeTurnCtb", (roomCode: string) => {
    changeRoomTurn(roomCode, socket);
  });

  // counter + 1 and check whtat's happen
  // if counter !== max, add 1 to counter and continue the game
  // if counter === max, user lose (explode) or if 2 players left end the game
  socket.on("counterCtb", async (roomCode: string) => {
    incrementCounter(roomCode).then(async () => {
      const bombData = await new Promise<Bomb>((resolveBomb, rejectBomb) => {
        db.get(`SELECT * FROM bomb WHERE id = "${roomCode}"`, [], (err: Error, bomb_row: Bomb) => {
          if (err) {
            rejectBomb(err);
          } else {
            resolveBomb(bomb_row);
          }
        });
      });
      const usersArray = await new Promise<User[]>((resolveUsers, rejectUsers) => {
        db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND alive = true AND is_disconnect = false`, [], (err: Error, users_rows: User[]) => {
          if (err) {
            rejectUsers(err);
          } else {
            resolveUsers(users_rows);
          }
        });
      });

      // bomb explode
      if (bombData.counter == bombData.max) {
        // end the game
        if (usersArray.length == 2) {
          usersArray.forEach((user) => {
            // -30% points to the user
            if (user.id == socket.id) {
              updateUserScoreMultiply(roomCode, user.id, 0.7, socket);
            } else {
              updateUserScore(user.id, 50, socket);
            }
          });
          // update alive users to true
          updateUsersAlive(roomCode, true);
          // send data to the client
          usersData(roomCode, socket);
          socket.nsp.to(roomCode).emit("receiveEndCtb");
          await updateRoomRound(roomCode, 0, socket);
          usersResetData(roomCode, socket);
          socket.nsp.to(roomCode).emit("receiveNextGame");
        } else {
          // user explode
          // update new max number of clicks and reset counter
          const max = Math.round(Math.random() * ((usersArray.length - 1) * 5 - 1)) + 1;
          await updateDataBomb(max, 0, roomCode)
            .then(async () => {
              // update user as dead
              updateUserAlive(socket.id, false);
            })
            .then(async () => {
              // update turn
              await changeRoomTurn(roomCode, socket);
            })
            .then(() => {
              // -30% points to the user
              updateUserScoreMultiply(roomCode, socket.id, 0.7, socket);
            })
            .then(() => {
              // send data to the client
              usersData(roomCode, socket);
              socket.nsp.to(roomCode).emit("receiveCounterCtb", 0);
              socket.nsp.to(roomCode).emit("receiveExplosionCtb", socket.id);
            });
        }
      } else {
        // continue the game, +10 points to the user
        socket.nsp.to(roomCode).emit("receiveCounterCtb", bombData.counter);
        updateUserScore(socket.id, 10, socket);
        usersData(roomCode, socket);
      }
    });
  });

  // get bomb data
  socket.on("getBombData", async (roomCode: string) => {
    const isGameStarted = await new Promise<Bomb>((resolve, reject) => {
      db.get(`SELECT * FROM bomb WHERE id = "${roomCode}"`, [], (err: Error, bomb_row: Bomb) => {
        if (err) {
          console.log("Start CTB In Room error");
          reject(err);
        } else {
          resolve(bomb_row);
        }
      });
    });
    if (isGameStarted) {
      const counter = await new Promise<number>((resolveBomb, rejectBomb) => {
        db.get(`SELECT * FROM bomb WHERE id = "${roomCode}"`, [], (err: Error, bomb_row: Bomb) => {
          if (err) {
            rejectBomb(err);
          } else {
            resolveBomb(bomb_row.counter);
          }
        });
      });
      const turn = await new Promise<number>((resolveTurn, rejectTurn) => {
        db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, room_row: Room) => {
          if (err) {
            rejectTurn(err);
          } else {
            resolveTurn(room_row.turn);
          }
        });
      });
      const users = await new Promise<User[]>((resolveUsers, rejectUsers) => {
        db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, users_rows: User[]) => {
          if (err) {
            rejectUsers(err);
          } else {
            resolveUsers(users_rows);
          }
        });
      });
      const username = users[turn].username;
      const id = users[turn].id;

      socket.nsp.to(roomCode).emit("receiveCounterCtb", counter);
      socket.nsp.to(roomCode).emit("receiveTurnCtb", { username, id });
    }
  });
  //#endregion
};
