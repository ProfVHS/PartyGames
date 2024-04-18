import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";

import { Room, User } from "../index";

module.exports = (io: Server, socket: Socket, db: Database) => {
  //#region battleships functions

  //#endregion
  //#region battleships sockets
  socket.on("startGameBattleships", async (roomCode: string) => {
    console.log("startGameBattleships");
  });

  //#endregion
};
