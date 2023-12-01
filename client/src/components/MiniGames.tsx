import { Socket } from "socket.io-client";
import Leaderboard from "./Leaderboard";
import { useEffect, useState } from "react";
import Ctb from "./Ctb";
import { TrickyDiamonds } from "./TrickyDiamonds/TrickyDiamonds";

interface MiniGamesProps {
  socket: Socket;
  users: { id: string; username: string; score: number; id_room: string }[];
  roomCode: string;
}

export default function MiniGames({ socket, roomCode, users }: MiniGamesProps) {
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] =
    useState<boolean>(true);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);

  const [isEndGame, setIsEndGame] = useState<boolean>(false);

  const allGames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // all
  const currentGames = [2, 5, 4, 2, 1]; // 1-Ctb, 2-Diamond, ...

  const [currentGame, setCurrentGame] = useState<number>(currentGames[0]);

  setTimeout(() => {
    setIsLoadingLeaderboard(false);
    setIsLoadingGame(true);
  }, 5000);

  useEffect(() => {
    socket.on("receive_ctb_end", (data) => {
      setTimeout(() => setIsEndGame(true), 1250);
    });
  }, [currentGame]);

  const switchGame = (currentGame: number) => {
    switch (currentGame) {
      case 1:
        return <Ctb socket={socket} roomCode={roomCode} />;
      case 2:
        return <TrickyDiamonds />;
      case 3:
        return <div>Gra 3</div>;
      default:
        return <div>Error</div>;
    }
  };

  // server-side : socket.emit(;end-game', roomCode )
  return (
    <>
      {!isEndGame && switchGame(currentGame)}
      {isEndGame && <Leaderboard users={users} />}
    </>
  );
}
