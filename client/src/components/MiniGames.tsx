import { socket } from "../socket";
import { useEffect, useState, useRef } from "react";

import { Ctb } from "./ClickTheBomb/Ctb";
import { Cards } from "./Cards";
import { User, Room, MinigamesType } from "../Types";
import { TrickyDiamonds } from "./TrickyDiamonds/TrickyDiamonds";
import { ColorsMemory } from "./ColorsMemory/ColorsMemory";
import { Buddies } from "./Buddies/Buddies";
import { AnimatePresence } from "framer-motion";
import Leaderboard from "./Leaderboard/Leaderboard";

interface MiniGamesProps {
  roomCode: string;
  users: User[];
  roomData: Room | null;
}

export default function MiniGames({ users, roomCode, roomData }: MiniGamesProps) {
  const [gamesArray, setGamesArray] = useState<MinigamesType[]>([]);

  const [currentGame, setCurrentGame] = useState<MinigamesType>("MINIGAMEEND");
  const [nextMinigame, setNextMinigame] = useState<MinigamesType>("MINIGAMEEND");
  const [minigameIndex, setMinigameIndex] = useState<number>(0);

  const [usersBeforeGame, setUsersBeforeGame] = useState<User[]>([]); // users before game starts for leaderboard

  const onceDone = useRef<boolean>(false);

  // === Socket.io events === //
  useEffect(() => {
    const solo = () => {
      console.log("solo")
      setCurrentGame("SOLOINROOM");
    }

    socket.on("receiveGamesArray", (games, current) => {
      setGamesArray(games);

      setMinigameIndex(current);

      const firstGame = games[current];
      setCurrentGame(firstGame);
    });

    socket.on("receiveNextGame", () => {
      setCurrentGame("MINIGAMEEND");
    });

    socket.on("receiveSoloInRoom", solo);

    return () => {
      socket.off("receiveNextGame");
      socket.off("receiveGamesArray");
      //socket.off("receiveSoloInRoom", solo);
    }
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
    if (currentGame !== "MINIGAMEEND" && currentGame !== "LEADERBOARD") {
      setUsersBeforeGame(users);
    }

    if (currentGame === "LEADERBOARD") {
      const leaderboardTime = users.length * 500 + 3500;
      setTimeout(() => {
        setCurrentGame("MINIGAMEEND");
      }, leaderboardTime);
    }

    if (currentGame === "ENDGAME") {
      // TODO: change to end game screen
    }
  }, [currentGame]);

  useEffect(() => {
    if(!gamesArray){
      socket.emit("gamesArray", roomCode);
    }
  }, [])

  useEffect(() => {
    document.cookie = `${socket.id}`;
  }, [])

  const handleMiniGameEnd = () => {
    const newMinigameIndex = minigameIndex + 1;
    const newNextGame = minigameIndex + 1 < gamesArray.length ? gamesArray[newMinigameIndex] : "ENDGAME";

    setMinigameIndex(newMinigameIndex);
    setNextMinigame(newNextGame);
    setTimeout(() => setCurrentGame("LEADERBOARD"), 1000);
  };

  return (
    <>
      <AnimatePresence>
        {currentGame === "SOLOINROOM" && <input placeholder="Samotny Wilk"/>}
        {currentGame === "LEADERBOARD" && <Leaderboard oldUsers={usersBeforeGame} newUsers={users} onExit={() => setCurrentGame(nextMinigame)} />}
        {currentGame === "CLICKTHEBOMB" && <Ctb roomData={roomData} roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "CARDS" && <Cards roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "TRICKYDIAMONDS" && <TrickyDiamonds roomData={roomData} roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "COLORSMEMORY" && <ColorsMemory roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "BUDDIES" && <Buddies roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
      </AnimatePresence>
    </>
  );
}
