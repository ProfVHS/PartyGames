import { socket } from "../socket";
//import Leaderboard from "./Leaderboard";
import { useEffect, useState, useRef } from "react";
import { Ctb } from "./Ctb";
import { Cards } from "./Cards";
import { User } from "../Types";
import { TrickyDiamonds } from "./TrickyDiamonds/TrickyDiamonds";
import { ColorsMemory } from "./ColorsMemory/ColorsMemory";
import { Buddies } from "./Buddies/Buddies";

interface MiniGamesProps {
  roomCode: string;
  users: User[];
}

export default function MiniGames({ users, roomCode }: MiniGamesProps) {

  // const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
  // const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);
  // const [isEndGame, setIsEndGame] = useState<boolean>(false);

  const [gamesArray, setGamesArray] = useState<number[]>();
  const currentGame = useRef<number | undefined>(2);

  const onceDone = useRef<boolean>(false);

  useEffect(() => {
    if(onceDone.current) return;

    if(users[0].id === socket.id){
      socket.emit("gamesArray", roomCode);
    }

    document.cookie = `${socket.id}`;
        
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
        return <Ctb roomCode={roomCode} users={users} />;
      case 2:
        return <Cards roomCode={roomCode} users={users} />;
      case 3:
        return <TrickyDiamonds roomCode={roomCode} users={users} />;
      case 4:
        return <ColorsMemory roomCode={roomCode} users={users} />;
      case 5:
        return <Buddies roomCode={roomCode} users={users} />;
      case 6:
        return <div>Gra 6</div>;
      case 7:
        return <div>Gra 7</div>;
      case 8:
        return <div>Gra 8</div>;
      default:
        return <div>Error</div>;
    }
  };

  // server-side : socket.emit('end-game', roomCode )
  return (
    <>
      {switchGame(currentGame.current)}
    </>
  );
  }

