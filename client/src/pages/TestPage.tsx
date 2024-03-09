import { useEffect, useRef, useState } from "react";
import { User } from "../Types";
import { Ctb } from "../components/ClickTheBomb/Ctb";
import { ColorsMemory } from "../components/ColorsMemory/ColorsMemory";
import { AnimatePresence, useAnimate } from "framer-motion";
import Leaderboard from "../components/Leaderboard/Leaderboard";
import { Cards } from "../components/Cards";
import { TrickyDiamonds } from "../components/TrickyDiamonds/TrickyDiamonds";

const exampleUsers: User[] = [
  {
    id: "0",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 150,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "1",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 300,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "2",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 75,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "3",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 2,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "4",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 400,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "5",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 250,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "6",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 100,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
  {
    id: "7",
    username: "Ultra Mango Guy",
    isDisconnected: false,
    score: 65,
    alive: true,
    id_room: "0",
    id_selected: 0,
    position: 1,
  },
];

export default function TestPage() {
  const [currentGame, setCurrentGame] = useState<number | undefined>(2);
  const [lastGame, setLastGame] = useState<number | undefined>(1);
  const [nextGame, setNextGame] = useState<number | undefined>(1);

  const handleClick = () => {
    const newCurrentGame = -1;
    const newLastGame = currentGame;
    const newNextGame = newLastGame === 1 ? 2 : 1;

    setCurrentGame(newCurrentGame);
    setLastGame(newLastGame);
    setNextGame(newNextGame);
  };

  return (
    <div className="roomGrid">
      <div className="roomContent">
        <AnimatePresence>
          {currentGame === 1 && <ColorsMemory roomCode="12345" users={exampleUsers} onExit={() => setCurrentGame(0)} />}
          {currentGame === 2 && (
            <TrickyDiamonds roomCode="12345" users={exampleUsers} onExit={() => setCurrentGame(0)} />
          )}
          {currentGame === 0 && (
            <Leaderboard oldUsers={exampleUsers} newUsers={exampleUsers} onExit={() => setCurrentGame(nextGame)} />
          )}
        </AnimatePresence>
        <button onClick={handleClick} style={{ position: "absolute", top: 0 }}>
          Colors Memory
        </button>
      </div>
    </div>
  );
}
