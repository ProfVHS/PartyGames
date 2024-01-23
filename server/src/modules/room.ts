import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";
import { User } from "../index";
import { Room } from "../index";

interface Count {
  count: number
};

module.exports = (
  io: Server, 
  socket: Socket, 
  db: Database, 
  usersData: (roomCode: string, socket: Socket) => void, 
  roomData: (roomCode: string, socket: Socket) => void,
  updateUserSelected: (id: string, selected: number) => void,
  updateUserAlive: (id: string, alive: boolean) => Promise<void>,
  ) => {
  //#region home events (homepage, lobby, etc) needed at the beginning of the game
  // create room
  socket.on("createRoom", async (data : { randomRoomCode: string, name : string }) => {
    socket.join(data.randomRoomCode);

    db.run(`INSERT INTO rooms (id,turn,ready,time_left,time_max,in_game,round) VALUES ("${data.randomRoomCode}", 0, 0, 0, 0, false,0)`);
    db.run(`INSERT INTO users (id,username,score,alive,id_room,id_selected,position) VALUES ("${socket.id}", "${data.name}", 100, true, "${data.randomRoomCode}",0,1)`);
    
  });
  // join room
  socket.on("joinRoom", async (data: { roomCode: string, name: string }) => {
    socket.join(data.roomCode);
    
    return new Promise<[User[], Count[], Room]>((resolve, reject) => {
      Promise.all([
        new Promise<User[]>((resolveUsers, rejectUsers) => {
          db.all(`SELECT * FROM users WHERE id_room = "${data.roomCode}"`, [], (err: Error, users_rows: User[]) => {
            if (err) {
              rejectUsers(err);
            } else {
              resolveUsers(users_rows);
            }
          });
        }),
        new Promise<Count[]>((resolveCount, rejectCount) => {
          db.all(`SELECT COUNT(*) AS "count" FROM users WHERE id_room = "${data.roomCode}" AND username IN ( "${data.name}", "${data.name} (1)", "${data.name} (2)", "${data.name} (3)", "${data.name} (4)", "${data.name} (5)", "${data.name} (6)" )`, [], (err: Error, count_row: Count[]) => {
            if (err) {
              rejectCount(err);
            } else {
              resolveCount(count_row);
            }
          });
        }),
        new Promise<Room>((resolveRoom, rejectRoom) => {
          db.get(`SELECT * FROM rooms WHERE id = "${data.roomCode}"`, [], (err: Error, room_row: Room) => {
            if (err) {
              rejectRoom(err);
            } else {
              resolveRoom(room_row);
            }
          });
        })
      ]).then(([users_rows, count_row, room_row]) => {
        resolve([users_rows, count_row, room_row]);
      })
      .catch((error) => {
        reject(error);
      });
    }).then(([users_rows, count_row, room_row]) => {
      // check if room is full (max 8 users)
      if(users_rows.length < 8){
        // check if room is in game (if it is, don't let user join)
        if(room_row.in_game){
          socket.emit("roomInGame");
        } else {
          // else let user join
          socket.emit("roomNotFull");
          if(count_row[0].count == 0){
            db.run(`INSERT INTO users (id,username,score,alive,id_room,id_selected,position) VALUES ("${socket.id}", "${data.name}", 100, true, ${data.roomCode},0,1)`);
          } else {
            db.run(`INSERT INTO users (id,username,score,alive,id_room,id_selected,position) VALUES ("${socket.id}", "${data.name} (${count_row[0].count})", 100, true, ${data.roomCode},0,1)`);
          }  
        }   
      } else {
        socket.emit("roomFull");
      }
    });
    
  });
  // check room existence
  socket.on("checkRoomExistence", async ( roomCode: string ) => {
    db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err, row) => {
      if(!err){
        socket.emit("roomExistenceResponse", row ? true : false);
      }
    });
  });
  // users ready
  socket.on("usersReady", async (data: { roomCode: string, ready: boolean}) => {
    const ready = data.ready ? -1 : 1;

    db.run(`UPDATE rooms SET ready = ready + ${ready} WHERE id = ${data.roomCode}`);

    roomData(data.roomCode, socket);
  });
  // generate random games array
  socket.on("gamesArray", async ( roomCode: string ) => {
    const gamesArray: Set<number> = new Set();

    while (gamesArray.size < 5 ){
      gamesArray.add(Math.floor(Math.random() * (5 - 1 + 1)) + 1);
    }

    console.log(gamesArray);

    socket.nsp.to(roomCode).emit("receiveGamesArray", Array.from(gamesArray));
  });
  //#endregion

  //#region room events (data, time, etc) needed during the game
  // users data
  socket.on("usersData", async ( roomCode: string ) => {
    usersData(roomCode, socket);
  });
  // room data
  socket.on("roomData", async ( roomCode: string ) => {
    roomData(roomCode, socket);
  });
  // stopwatch time
  socket.on("stopwatchTime", async (roomCode: string) => {
    // set interval to decrease time_left every second
    const cardsTimeInterval = setInterval( async () => {
        db.run(`UPDATE rooms SET time_left = time_left - 1 WHERE id = ${roomCode}`);
        // send time_left to all users in room
        return new Promise<Room>((resolve, reject) => {
            db.get(`SELECT * FROM rooms WHERE id = "${roomCode}"`, [], (err: Error, row: Room) => {
                if(err){
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        }).then((row) => {
            row.time_left >= 0 ? socket.nsp.to(roomCode).emit("receiveStopwatchTime", row.time_left) : clearInterval(cardsTimeInterval);
        });
    }, 1000);
  });
  //#endregion

  //#region user events (selected object, alive, etc)
  // update selected object
  socket.on("selectedObject", async ( selected: number ) => {
    updateUserSelected(socket.id, selected);
  });
  // update user alive
  socket.on("updateUserAlive", async ( alive: boolean ) => {
    updateUserAlive(socket.id, alive);
  });
  //#endregion
};
