import "./TrickyDiamonds.scss";
import { TrickyCard } from "./TrickyCard";
import { useEffect, useState, useRef } from "react";
import { Stopwatch } from "../Stopwatch/Stopwatch";
import { socket } from "../../socket";

import { User, Room } from "../../Types";
import { useAnimate, usePresence, motion } from "framer-motion";
interface TrickyDiamondsProps {
  roomData: Room | null;
  roomCode: string;
  users: User[];
  onExit?: () => void;
}

//type DiamondsState = 0 | 1 | 2;

export function TrickyDiamonds({ roomData, roomCode, users, onExit }: TrickyDiamondsProps) {
  const [selectedDiamond, setSelectedDiamond] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number[]>([0, 0, 0]);
  const [time, setTime] = useState<number>(10);
  const [endRound, setEndRound] = useState<boolean>(false);

  const onceDone = useRef<boolean>(false);

  // Enter and exit Animations

  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresence) {
      const showUpHeaderElements = async () => {
        // Header animation for elements to show up
        animate(".tricky__header__text", { scale: [0, 1] }, { duration: 1, type: "spring", delay: 0.05 });
        animate(".tricky__stopwatch", { scale: [0, 1] }, { duration: 1, type: "spring", delay: 0.05 });
      };
      const showUpDiamondsElements = async () => {
        // Tricky Cards (Card with diamond) animation for elements to show up
        animate(".tricky__cards__item__diamond", { scale: [0, 1] }, { duration: 1, type: "spring", delay: 0.05 });
        await animate(".tricky__cards__item__value", { scale: [0, 1] }, { duration: 1, type: "spring", delay: 0.05 });
      };

      const enterAnimation = async () => {
        await animate(".tricky__header", { width: ["0%", "100%"] }, { duration: 1, type: "spring", delay: 0.05 });
        await showUpHeaderElements();
        await animate(".tricky__cards__item", { height: [0, 175] }, { duration: 1.4, type: "spring", delay: 0.05 });
        await showUpDiamondsElements();
      };
      enterAnimation();
    } else {
      setSelectedDiamond(-1);

      const exitAnimation = async () => {
        const hideElements = async () => {
          // Header animation for elements to hide
          animate(".tricky__header__text", { scale: [1, 0] }, { duration: 1, type: "spring" });
          animate(".tricky__stopwatch", { scale: [1, 0] }, { duration: 1, type: "spring" });
          // Tricky Cards (Card with diamond) animation for elements to hide
          animate(".tricky__cards__item__diamond", { scale: [1, 0] }, { duration: 1, type: "spring" });
          await animate(".tricky__cards__item__value", { scale: [1, 0] }, { duration: 1, type: "spring" });
        };

        await hideElements();
        await animate(".tricky__cards__item", { height: [175, 0] }, { duration: 1, type: "spring" });
        animate(".tricky__header", { opacity: [1, 0] }, { duration: 1, type: "spring", delay: 0.2 });
        await animate(".tricky__header", { width: ["100%", "0%"] }, { duration: 1, type: "spring" });
        safeToRemove();
        onExit && onExit();
      };
      exitAnimation();
    }
  }, [isPresence]);

  const handleClick = (color: number) => {
    const newColor = color;
    setSelectedDiamond(newColor);
    console.log(newColor);
  };

  const startGameDiamonds = () => {
    const host = users.find((user) => user.id == socket.id)?.is_host;

    if (host) {
      socket.emit("startGameDiamonds", roomCode);
      socket.emit("stopwatchTime", roomCode);
    }
    
    setEndRound(false);
  };

  useEffect(() => {
    if (onceDone.current) return;

    startGameDiamonds();

    onceDone.current = true;
  }, []);

  useEffect(() => {
    socket.emit("selectedObject", selectedDiamond);
  }, [selectedDiamond]);

  useEffect(() => {
    const stopwatchTime = (data: number) => {
      setTime(data);
    };

    const diamondScore = (array: number[]) => {
      const newArray = [array[0], array[1], array[2]];
      setScore(newArray);
    };

    socket.on("receiveStopwatchTime", stopwatchTime);

    socket.on("receiveDiamondsScore", diamondScore);

    return () => {
      socket.off("receiveStopwatchTime", stopwatchTime);
      socket.off("receiveDiamondsScore", diamondScore);
    };
  }, [socket]);

  useEffect(() => {
    if (time == 0) {
      const host = users.find((user) => user.id == socket.id)?.is_host;

      if (host) {
        socket.emit("endRoundDiamonds", roomCode);
      }
      
      setEndRound(true);
      setTimeout(() => {
        startGameDiamonds();
      }, 3000);
    }
  }, [time]);

  useEffect(() => {
    if(score[0] == 0 && roomData?.in_game){
      console.log("score is null");
      socket.emit("getDiamondsScore", roomCode);
    }
  }, [window.onload]);

  return (
    <div className="tricky" ref={scope}>
      <div className="tricky__header">
        <motion.div className="tricky__stopwatch" initial={{ scale: 0 }}>
          <Stopwatch maxTime={10} timeLeft={time} size={50} />
        </motion.div>
        <motion.span className="tricky__header__text" initial={{ scale: 0 }}>
          Round - {round}
        </motion.span>
      </div>
      <div className="tricky__cards">
        <TrickyCard
          id={0}
          points={score[0]}
          color={"BLUE"}
          selectedColor={selectedDiamond}
          handleClick={handleClick}
          turnEnded={endRound}
        />
        <TrickyCard
          id={1}
          points={score[1]}
          color={"PURPLE"}
          selectedColor={selectedDiamond}
          handleClick={handleClick}
          turnEnded={endRound}
        />
        <TrickyCard
          id={2}
          points={score[2]}
          color={"RED"}
          selectedColor={selectedDiamond}
          handleClick={handleClick}
          turnEnded={endRound}
        />
      </div>
    </div>
  );
}
