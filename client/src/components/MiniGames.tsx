import { socket } from "../socket";
//import Leaderboard from "./Leaderboard";
import { useEffect, useState, useRef } from "react";
import { Ctb } from "./ClickTheBomb/Ctb";
import { Cards } from "./Cards";
import { User } from "../Types";
import { TrickyDiamonds } from "./TrickyDiamonds/TrickyDiamonds";
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

  // === Socket.io events === //
  useEffect(() => {
    socket.on("receiveGamesArray", (data) => {
      setGamesArray(data);

      const firstGame = data[0];
      setCurrentGame(firstGame);
    });

    socket.on("receiveNextGame", () => {
      setCurrentGame(-1);
      console.log("next game");
    });
  }, [socket]);

  // === on first render === //
  useEffect(() => {
    setUsersBeforeGame(users);
    if (onceDone.current === false) {
      if (users[0].id === socket.id) {
        socket.emit("gamesArray", roomCode);
      }
      onceDone.current = true;
    }
  }, []);

  // === on currentGame change === //
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

  const handleMiniGameEnd = () => {
    const newMinigameIndex = minigameIndex + 1;
    const newNextGame = gamesArray![newMinigameIndex];

    setMinigameIndex(newMinigameIndex);
    setNextMinigame(newNextGame);
    setTimeout(() => setCurrentGame(0), 1000);
  };

  console.log("usersBeforeGame");
  console.log(usersBeforeGame);
  console.log("users");
  console.log(users);

  return (
    <>
      <AnimatePresence>
        {currentGame === 0 && (
          <Leaderboard oldUsers={usersBeforeGame} newUsers={users} onExit={() => setCurrentGame(nextMinigame)} />
        )}
        {currentGame === 1 && <Ctb roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === 2 && <Cards roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === 3 && <TrickyDiamonds roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === 4 && <ColorsMemory roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === 5 && <Buddies roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
      </AnimatePresence>
    </>
  );
}
