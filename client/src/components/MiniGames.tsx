import { socket } from "../socket";
//import Leaderboard from "./Leaderboard";
import { useEffect, useState, useRef } from "react";
import { Ctb } from "./ClickTheBomb/Ctb";
import { Cards } from "./Cards";
import { User } from "../Types";
import { TrickyDiamonds } from "./TrickyDiamonds/TrickyDiamonds";
import { Battleships } from "./Battleships/Battleships";
import { ColorsMemory } from "./ColorsMemory/ColorsMemory";
import { Buddies } from "./Buddies/Buddies";
import { AnimatePresence } from "framer-motion";
import Leaderboard from "./Leaderboard/Leaderboard";

interface MiniGamesProps {
  roomCode: string;
  users: User[];
}

export default function MiniGames({ users, roomCode }: MiniGamesProps) {
  // const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
  // const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);
  // const [isEndGame, setIsEndGame] = useState<boolean>(false);

  const [gamesArray, setGamesArray] = useState<number[]>([]);

  const [currentGame, setCurrentGame] = useState<number>(-1);
  const [nextMinigame, setNextMinigame] = useState<number>(-1);
  const [minigameIndex, setMinigameIndex] = useState<number>(0);

  const [usersBeforeGame, setUsersBeforeGame] = useState<User[]>([]); // users before game starts for leaderboard

  const onceDone = useRef<boolean>(false);

  useEffect(() => {
    if (onceDone.current) return;

    if (users[0].id === socket.id) {
      socket.emit("gamesArray", roomCode);
    }

    onceDone.current = true;
    document.cookie = `${socket.id}`;
  }, []);

  useEffect(() => {
    if (!onceDone) {
      socket.on("receiveGamesArray", (data) => {
        setGamesArray(data);
        console.log("test");
        console.log(data);
        console.log(gamesArray);
        setCurrentGame(1);
      });
    }

    socket.on("receiveNextGame", () => {
      setCurrentGame(-1);
      console.log("next game");
      console.log(gamesArray);
      const newMinigameIndex = minigameIndex + 1;
      const newNextGame = gamesArray![newMinigameIndex];

      setMinigameIndex(newMinigameIndex);
      setNextMinigame(newNextGame);
    });
  }, [socket]);

  //GET USERS BEFORE GAME STARTS

  //on first render
  useEffect(() => {
    setUsersBeforeGame(users);
  }, []);

  useEffect(() => {
    if (currentGame !== -1 && currentGame !== 0) {
      setUsersBeforeGame(users);
    }

    if (currentGame === 0) {
      setTimeout(() => {
        setCurrentGame(-1);
      }, 4000);
    }
  }, [currentGame]);

  // const switchGame = (currentGame: number | undefined) => {
  //   switch (currentGame) {
  //     case 1:
  //       return <Ctb roomCode={roomCode} users={users} />;
  //     case 2:
  //       return <Cards roomCode={roomCode} users={users} />;
  //     case 3:
  //       return <TrickyDiamonds roomCode={roomCode} users={users} />;
  //     case 4:
  //       return <ColorsMemory roomCode={roomCode} users={users} />;
  //     case 5:
  //       return <Buddies roomCode={roomCode} users={users} />;
  //     case 6:
  //       return <Battleships />;
  //     case 7:
  //       return <div>Gra 7</div>;
  //     case 8:
  //       return <div>Gra 8</div>;
  //     default:
  //       return <div>Error</div>;
  //   }
  // };

  // server-side : socket.emit('end-game', roomCode )
  return (
    <>
      <AnimatePresence>
        {currentGame === 0 && (
          <Leaderboard oldUsers={usersBeforeGame} newUsers={users} onExit={() => setCurrentGame(nextMinigame)} />
        )}
        {currentGame === 1 && <Ctb roomCode={roomCode} users={users} onExit={() => setCurrentGame(0)} />}
        {currentGame === 2 && <Cards roomCode={roomCode} users={users} onExit={() => setCurrentGame(0)} />}
        {currentGame === 3 && <TrickyDiamonds roomCode={roomCode} users={users} onExit={() => setCurrentGame(0)} />}
        {currentGame === 4 && <ColorsMemory roomCode={roomCode} users={users} onExit={() => setCurrentGame(0)} />}
        {currentGame === 5 && <Buddies roomCode={roomCode} users={users} onExit={() => setCurrentGame(0)} />}
      </AnimatePresence>
    </>
  );
}
