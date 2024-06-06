import { socket } from "../socket";
import { useEffect, useState, useRef } from "react";

import { Ctb } from "./ClickTheBomb/Ctb";
import { Cards } from "./Cards";
import { User, Room, MinigamesType, LeaderboardGameUser } from "../Types";
import { TrickyDiamonds } from "./TrickyDiamonds/TrickyDiamonds";
import { ColorsMemory } from "./ColorsMemory/ColorsMemory";
import { Buddies } from "./Buddies/Buddies";
import { AnimatePresence } from "framer-motion";
import Leaderboard from "./Leaderboard/Leaderboard";
import LastUserNotification from "./LastUserNotification/LastUserNotification";
import { useNavigate } from "react-router-dom";
import LeaderboardGame from "./LeaderboardGame/LeaderboardGame";

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
  const [leaderboardGameUsers, setLeaderboardGameUsers] = useState<LeaderboardGameUser[]>([]);

  const [usersBeforeGame, setUsersBeforeGame] = useState<User[]>([]); // users before game starts for leaderboard

  const host = users.find((user) => user.id == socket.id)?.is_host;

  const onceDone = useRef<boolean>(false);
  const navigate = useNavigate();

  // === Socket.io events === //
  useEffect(() => {
    socket.on("receiveGamesArray", (games, current) => {
      console.log("Przypisanie games array", current);
      setGamesArray(games);

      setMinigameIndex(current);

      const game = games[current];
      console.log("Current game: ", game);
      setCurrentGame(game);
    });

    socket.on("updateCurrentGame", (games, currentIndex) => {
      console.log("updateCurrentGame", currentIndex, games);
      setMinigameIndex(currentIndex);
      const nextGame = games[currentIndex] || "ENDGAME";
      setNextMinigame(nextGame);
      console.log("Next game: ", nextGame, games);
    });

    socket.on("receiveNextGame", () => {
      console.log("receiveNextGame");
      setCurrentGame("MINIGAMEEND");
    });

    socket.on("receiveSoloInRoom", () => {
      setCurrentGame("SOLOINROOM");
    });

    socket.on("receiveLeaderboardGameUsers", (users) => {
      setLeaderboardGameUsers(users);
    });

    socket.on("receiveEndMiniGames", () => {
      console.log("receiveEndMiniGames");
      setCurrentGame("ENDGAME");
    });

    return () => {
      socket.off("receiveGamesArray");
      socket.off("updateCurrentGame");
      socket.off("receiveNextGame");
      socket.off("receiveSoloInRoom");
      socket.off("receiveLeaderboardGameUsers");
      socket.off("receiveEndMiniGames");
    };
  }, [socket]);

  // === on first render === //
  useEffect(() => {
    setUsersBeforeGame(users);

    if (onceDone.current) return;

    if (host) {
      socket.emit("gamesArray", roomCode);
    }

    onceDone.current = true;
  }, []);

  // === on currentGame change === //
  useEffect(() => {
    if (currentGame !== "MINIGAMEEND" && currentGame !== "LEADERBOARD") {
      setUsersBeforeGame(users);
    }

    if (currentGame === "LEADERBOARD" || currentGame === "LEADERBOARDGAME") {
      const leaderboardTime = users.length * 500 + 3500;

      if (host) {
        console.log("Update current game index");
        socket.emit("updateCurrentGameIndex", roomCode);
      }

      setTimeout(() => {
        setCurrentGame("MINIGAMEEND");
        console.log("Leaderboard time is over");
      }, leaderboardTime);
    }

    console.log("Current game: ", currentGame);

    if (currentGame === "ENDGAME") {
      console.log("Endgame");
      console.log(users);
      console.log(roomCode);
      navigate("/endgame", { state: { roomCode, users } });
    }
  }, [currentGame]);

  useEffect(() => {
    localStorage.setItem("socketId", socket.id!);
  }, []);

  const handleMiniGameEnd = () => {
    if (currentGame === "COLORSMEMORY") {
      setCurrentGame("LEADERBOARDGAME");
    } else if (currentGame !== "SOLOINROOM") {
      setCurrentGame("LEADERBOARD");
    }
  };

  const handleSoloInRoomExit = () => {
    const newMinigameIndex = minigameIndex + 1;
    const newNextGame = minigameIndex + 1 < gamesArray.length ? gamesArray[newMinigameIndex] : "ENDGAME";

    setCurrentGame(newNextGame);
  };

  useEffect(() => {
    console.log(gamesArray);
  }, [gamesArray]);

  return (
    <>
      <AnimatePresence>
        {currentGame === "SOLOINROOM" && <LastUserNotification roomCode={roomCode} onExit={handleSoloInRoomExit} />}
        {currentGame === "LEADERBOARD" && <Leaderboard oldUsers={usersBeforeGame} newUsers={users} onExit={() => setCurrentGame(nextMinigame)} />}
        {currentGame === "LEADERBOARDGAME" && <LeaderboardGame users={leaderboardGameUsers} onExit={() => setCurrentGame(nextMinigame)} />}
        {currentGame === "CLICKTHEBOMB" && <Ctb roomData={roomData} roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "CARDS" && <Cards roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "TRICKYDIAMONDS" && <TrickyDiamonds roomData={roomData} roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "COLORSMEMORY" && <ColorsMemory roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
        {currentGame === "BUDDIES" && <Buddies roomCode={roomCode} users={users} onExit={handleMiniGameEnd} />}
      </AnimatePresence>
    </>
  );
}
