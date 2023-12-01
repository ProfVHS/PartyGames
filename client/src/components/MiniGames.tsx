import { Socket } from "socket.io-client";
import Leaderboard from "./Leaderboard";
import { useEffect, useState, useRef } from "react";
import Ctb from "./Ctb";

interface MiniGamesProps {
  socket: Socket;
  users: { id: string; username: string; score: number; alive: boolean; id_room: string }[];
  roomCode: string;
}

export default function MiniGames({ socket, users, roomCode }: MiniGamesProps) {
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);

  const [gamesArray, setGamesArray] = useState<number[]>();
  const currentGame = useRef<number | undefined>(1);

  const onceDone = useRef<boolean>(false);

  useEffect(() => {
    if(onceDone.current) return;

    if(users.length > 0){
      if(users[0].id === socket.id){
        socket.emit("gamesArray", roomCode);
      }
    }
    
    onceDone.current = true;
  }, []);

  useEffect(() => {
    socket.on("receiveGamesArray", (data) => {
      setGamesArray(data);
      //currentGame.current = data[0];
    });
  }, [socket]);

  const switchGame = (currentGame: number | undefined) => {
    switch (currentGame) {
      case 1:
        socket.emit("startGameCtb", { roomCode, users } );
        return <Ctb socket={socket} roomCode={roomCode} />;
      case 2:
        return <div>Gra 2</div>;
      case 3:
        return <div>Gra 3</div>;
      case 4:
        return <div>Gra 4</div>;
      case 5:
        return <div>Gra 5</div>;
      default:
        return <div>Error</div>;
    }
  };

  // server-side : socket.emit(;end-game', roomCode )
  return (
    <>
      {switchGame(currentGame.current)}
    </>
  );
}
