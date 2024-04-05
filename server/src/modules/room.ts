import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";
import { User, Room } from "../index";
interface Count {
  count: number;
}
interface GamesArray {
  roomCode: string;
  games: string[];
  currentGame: number;
}

const gamesArray: GamesArray[] = [];

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  usersData: (roomCode: string, socket: Socket) => void,
  roomData: (roomCode: string, socket: Socket) => void,
  updateUserSelected: (id: string, selected: number) => void,
  updateUserAlive: (id: string, alive: boolean) => Promise<void>,
  changeRoomTurn: (roomCode: string, socket: Socket) => void,
  updateRoomTurn: (roomCode: string, turn: number, socket: Socket) => void
) => {
  //#region functions
  const InfoAboutRoom = async () => {
    const roomCode = await new Promise<string>((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = "${socket.id}"`, [], (err: Error, row: User) => {
        if(err) {
          console.log(`Info About Room (roomCode) error:`);
          reject(err);
        } else {
          if(row){
            resolve(row.id_room);
          }
        }
      });
    });

    const isRoomInGame = await new Promise<boolean>((resolve, reject) => {
      db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
        if(err) {
          console.log(`Info About Room (isRoomInGame) error:`);
          reject(err);
        } else {
          resolve(row.in_game);
        }
      });
    });

    const usersLength = await new Promise<number>((resolve, reject) => {
      db.all(`SELECT * FROM users WHERE id_room = "${roomCode}" AND is_disconnect = false`, [], (err: Error, users_rows: User[]) => {
        if(err) {
          console.log(`Info About Room (usersLength) error:`);
          reject(err);
        } else {
          resolve(users_rows.length);
        }
      });
    });

    return { roomCode, isRoomInGame, usersLength };
  };

  const CheckWhatsToDoWithRoom = async (roomCode: string, isRoomInGame: boolean, usersLength: number) => {
    // last user - delete room
    if (usersLength == 1) {
      db.run(`DELETE FROM rooms WHERE id = "${roomCode}"`);
      db.run(`DELETE FROM users WHERE id_room = "${roomCode}"`);
    }
    // its lobby - delete user
    else if (!isRoomInGame) {
      db.run(`DELETE FROM users WHERE id = "${socket.id}"`);
    }
    // its game - set user as disconnected
    else {
      db.run(`UPDATE users SET alive = false, is_disconnect = true WHERE id = "${socket.id}"`);

      const users = await new Promise<User[]>((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE id_room = "${roomCode}"`, [], (err: Error, users_rows: User[]) => {
          if(err){
            console.log(`Check Whats To Do With Room (users) error:`);
            reject(err);
          } else {
            resolve(users_rows);
          }
        });
      });

      const lastUserIndex = users.findIndex((user) => user.is_disconnect == false);
      const disconnectedUserIndex = users.findIndex((user) => user.id == socket.id);

      if (usersLength == 2) {
        console.log("solo server");
        socket.nsp.to(roomCode).emit("receiveSoloInRoom");
        //socket.nsp.to(roomCode).emit("waitForOtherPlayers", true);
        updateUserAlive(users[lastUserIndex].id, true);
        updateRoomTurn(roomCode, lastUserIndex, socket);
      } else {
        changeRoomTurn(roomCode, socket);
      }

      socket.nsp.to(roomCode).emit("userDisconnectedRoom", users[disconnectedUserIndex].username);
    }
    socket.leave(roomCode);
  };
  //#endregion

  //#region home events (homepage, lobby, etc) needed at the beginning of the game
  // create room
  socket.on("createRoom", async (name: string, randomRoomCode: string, cookie_id: string) => {
    socket.join(randomRoomCode);

    db.all(`SELECT * FROM users WHERE id = "${cookie_id}"`, [], async (err: Error, users_rows: User[]) => {
      if(err) {
        console.log("Create Room error:");
        console.error(err);
      } else {
        if (users_rows.length > 0) {
          db.run(`DELETE FROM users WHERE id = "${cookie_id}"`);
          usersData(users_rows[0].id_room, socket);
        }
      }
    });

    db.run(`INSERT INTO rooms (id,turn,ready,time_left,time_max,in_game,is_minigame_started,round) VALUES ("${randomRoomCode}", 0, 0, 0, 0, false, false, 0)`);
    db.run(`INSERT INTO users (id,username,score,alive,is_disconnect,id_room,id_selected,position) VALUES ("${socket.id}", "${name}", 100, true, false, "${randomRoomCode}",0,1)`);
  });
  // join room
  socket.on("joinRoom", async (data: { roomCode: string; name: string; cookie_id: string }) => {
    console.log("Cookies id - ", data.cookie_id);

    const ifUserExist = await new Promise<Count>((resolve, reject) => {
      db.get(`SELECT COUNT(id) AS 'count' FROM users WHERE id = "${data.cookie_id}" AND is_disconnect = true`, [], (err: Error, exist: Count) => {
        if(err){
          console.log("Join Room error:");
          reject(err);
        } else {
          resolve(exist);
        }
      });
    });

    console.log("If user exist - ", ifUserExist.count);

    if (ifUserExist.count == 1) {
      socket.join(data.roomCode);

      db.run(`UPDATE users SET id = "${socket.id}", is_disconnect = false WHERE id = "${data.cookie_id}"`);

      socket.nsp.to(data.roomCode).emit("waitForOtherPlayers", false);
      socket.nsp.to(socket.id).emit("joiningRoom");
    } else {
      const users: User[] = await new Promise<User[]>((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE id_room = "${data.roomCode}"`, [], (err: Error, users_rows: User[]) => {
          if(err){
            console.log("Join Room (users) error:");
            reject(err);
          } else {
            resolve(users_rows);
          }
        });
      });

      const count: Count[] = await new Promise<Count[]>((resolve, reject) => {
        db.all(
          `SELECT COUNT(*) AS "count" FROM users WHERE id_room = "${data.roomCode}" AND username IN ( "${data.name}", "${data.name} (1)", "${data.name} (2)", "${data.name} (3)", "${data.name} (4)", "${data.name} (5)", "${data.name} (6)" )`,
          [], (err: Error, count_row: Count[]) => {
            if(err){
              console.log("Join Room (count) error:");
              reject(err);
            } else {
              resolve(count_row);
            }
          }
        );
      });

      const room: Room = await new Promise<Room>((resolve, reject) => {
        db.get(`SELECT * FROM rooms WHERE id = "${data.roomCode}"`, [], (err: Error, room_row: Room) => {
          if(err){
            console.log("Join Room (room) error:");
            reject(err);
          } else {
            resolve(room_row);
          }
        });
      });

      // check if room is full (max 8 users)
      if (users.length < 8) {
        // check if room is in game (if it is, don't let user join)
        if (room.in_game) {
          socket.nsp.to(socket.id).emit("roomInGame");
        } else {
          // else let user join (also check if user with the same name is already in room, if so, add (1) to his name, etc.
          socket.join(data.roomCode);
          socket.nsp.to(socket.id).emit("joiningRoom");

          if (count[0].count == 0) {
            db.run(`INSERT INTO users (id,username,score,alive,is_disconnect,id_room,id_selected,position) VALUES ("${socket.id}", "${data.name}", 100, true, false, "${data.roomCode}",0,1)`);
          } else {
            db.run(
              `INSERT INTO users (id,username,score,alive,is_disconnect,id_room,id_selected,position) VALUES ("${socket.id}", "${data.name} (${count[0].count})", 100, true, false, "${data.roomCode}", 0, 1)`
            );
          }
          socket.nsp.to(data.roomCode).emit("waitForOtherPlayers", false);
        }
      } else {
        socket.nsp.to(socket.id).emit("roomFull");
      }
    }
  });
  // check room existence
  socket.on("checkRoomExistence", async (roomCode: string) => {
    db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err, row) => {
      if (!err) {
        socket.emit("roomExistenceResponse", row ? true : false);
      }
    });
  });
  // users ready
  socket.on("usersReady", async (data: { roomCode: string; ready: boolean }) => {
    const ready = data.ready ? -1 : 1;

    db.run(`UPDATE rooms SET ready = ready + ${ready} WHERE id = "${data.roomCode}"`);

    roomData(data.roomCode, socket);
  });
  // generate random games array
  socket.on("gamesArray", async (roomCode: string) => {
    if(!gamesArray.find(roomCode => roomCode === roomCode)){
      const gamesSet: Set<string> = new Set();
      const gamesIDarray: string[] = ["CLICKTHEBOMB", "TRICKYDIAMONDS", "COLORSMEMORY", "CARDS", "BUDDIES"];
  
      while (gamesSet.size < 5) {
        const randomIndex = Math.floor(Math.random() * (5 - 1 + 1));
        gamesSet.add(gamesIDarray[randomIndex]);
      }
  
      gamesArray.push({roomCode: roomCode, games: Array.from(gamesSet), currentGame: 0});
    }

    const games = gamesArray.find(roomCode => roomCode === roomCode)?.games;
    const current = gamesArray.find(roomCode => roomCode === roomCode)?.currentGame;

    socket.nsp.to(roomCode).emit("receiveGamesArray", games, current);
  });
  //#endregion

  //#region room events (data, time, etc) needed during the game
  // users data
  socket.on("usersData", async (roomCode: string) => {
    usersData(roomCode, socket);
  });
  // room data
  socket.on("roomData", async (roomCode: string) => {
    roomData(roomCode, socket);
  });
  // stopwatch time
  socket.on("stopwatchTime", async (roomCode: string) => {
    // set interval to decrease time_left every second
    const cardsTimeInterval = setInterval(async () => {
      db.run(`UPDATE rooms SET time_left = time_left - 1 WHERE id = "${roomCode}"`);
      // send time_left to all users in room
      new Promise<Room>((resolve, reject) => {
        db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
          if (err) {
            console.log("StopwatchTime error:");
            reject(err);
          } else {
            resolve(row);
          }
        });
      })
        .then((row) => {
          row.time_left >= 0 ? socket.nsp.to(roomCode).emit("receiveStopwatchTime", row.time_left) : clearInterval(cardsTimeInterval);
        })
        .catch(() => {
          clearInterval(cardsTimeInterval);
        });
    }, 1000);
  });
  //#endregion

  //#region user events (selected object, alive, etc)
  // update selected object
  socket.on("selectedObject", async (selected: number) => {
    updateUserSelected(socket.id, selected);
  });
  // update user alive
  socket.on("updateUserAlive", async (alive: boolean) => {
    updateUserAlive(socket.id, alive);
  });

  socket.on("checkIfUserIsInRoom", async (roomCode: string) => {
    const userInRoom = await new Promise<boolean>((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = "${socket.id}" AND id_room = "${roomCode}"`, [], (err: Error, row: User) => {
        if (!err) {
          resolve(row ? true : false);
        }
      });
    });
    socket.nsp.to(socket.id).emit("receiveUserIsInRoom", userInRoom);
  });

  socket.on("disconnectUser", async () => {
    const { roomCode, isRoomInGame, usersLength } = await InfoAboutRoom();

    CheckWhatsToDoWithRoom(roomCode, isRoomInGame, usersLength);

    usersData(roomCode, socket);
  });

  socket.on("disconnect", async () => {
    const { roomCode, isRoomInGame, usersLength } = await InfoAboutRoom();

    CheckWhatsToDoWithRoom(roomCode, isRoomInGame, usersLength);

    usersData(roomCode, socket);
  });
  //#endregion
};
