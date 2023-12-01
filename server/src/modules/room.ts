import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";
import { User } from "../index";

interface Count {
  count: number
};

module.exports = (
  io: Server, 
  socket: Socket, 
  db: Database, 
  usersData: (room: string, socket: Socket) => void, 
  roomData: (room: string, socket: Socket) => void) => {

  socket.on("createRoom", (data : { randomRoomCode: string, name : string }) => {
    socket.join(data.randomRoomCode);

    db.run(`INSERT INTO rooms (id,turn,ready,time_left,time_max) VALUES (${data.randomRoomCode}, 0, 0, 0, 0)`);
    db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name}", 100, true, ${data.randomRoomCode})`);
    db.run(`INSERT INTO bomb (id,counter,max) VALUES (${data.randomRoomCode}, 0, 0)`);
    usersData(data.randomRoomCode, socket);
  });

  socket.on("joinRoom", async (data: { roomCode: string, name: string }) => {
    socket.join(data.roomCode);
    
    return new Promise<[User[], Count[]]>((resolve, reject) => {
      Promise.all([
        new Promise<User[]>((resolveUsers, rejectUsers) => {
          db.all(`SELECT * FROM users WHERE id_room = ${data.roomCode}`, [], (err: Error, users_rows: User[]) => {
            if (err) {
              rejectUsers(err);
            } else {
              resolveUsers(users_rows);
            }
          });
        }),
        new Promise<Count[]>((resolveCount, rejectCount) => {
          db.all(`SELECT COUNT(*) AS "count" FROM users WHERE id_room = ${data.roomCode} AND username IN ( "${data.name}", "${data.name} (1)", "${data.name} (2)", "${data.name} (3)", "${data.name} (4)", "${data.name} (5)", "${data.name} (6)" )`, [], (err: Error, count_row: Count[]) => {
            if (err) {
              rejectCount(err);
            } else {
              resolveCount(count_row);
            }
          });
        }),
      ]).then(([users_rows, count_row]) => {
        resolve([users_rows, count_row]);
      })
      .catch((error) => {
        reject(error);
      });
    }).then(([users_rows, count_row]) => {
      if(users_rows.length < 8){
        socket.emit("roomNotFull");
        if(count_row[0].count == 0){
          db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name}", 100, true, ${data.roomCode})`);
        } else {
          db.run(`INSERT INTO users (id,username,score,alive,id_room) VALUES ("${socket.id}", "${data.name} (${count_row[0].count})", 100, true, ${data.roomCode})`);
        }
        usersData(data.roomCode, socket);
      } else {
        socket.emit("roomFull");
      }
    });
    
  });

  socket.on("checkRoomExistence", ( room: string ) => {
    db.get(`SELECT * FROM rooms WHERE id = "${room}"`, [], (err, row) => {
      if(!err){
        socket.emit("roomExistenceResponse", row ? true : false);
      }
    });
  });

  socket.on("usersData", ( room: string ) => {
    usersData(room, socket);
  });

  socket.on("usersReady", (data: { roomCode: string, ready: boolean }) => {
    const ready = data.ready ? -1 : 1;
    db.run(`UPDATE rooms SET ready = ready + ${ready} WHERE id = ${data.roomCode}`);

    roomData(data.roomCode, socket);
  });

};
