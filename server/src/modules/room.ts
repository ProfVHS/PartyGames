import { Socket, Server } from "socket.io";

module.exports = (io: Server, socket: Socket) => {
  socket.on("createRoom", (room: string) => {
    socket.join(room);
  });

  socket.on("joinRoom", (room: string) => {
    socket.join(room);
  });

  socket.on("leave", (room: string) => {
    socket.leave(room);
  });

  socket.on("message", (room: string, message: string) => {
    io.to(room).emit("message", message);
  });
};
