import { Button } from "./Button";
import { User } from "../../Types";
import "./style.scss";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

import redButtonSound from "../../assets/audio/colormemory/button1.flac";
import orangeButtonSound from "../../assets/audio/colormemory/button2.flac";
import yellowButtonSound from "../../assets/audio/colormemory/button3.flac";
import darkblueButtonSound from "../../assets/audio/colormemory/button4.flac";
import blueButtonSound from "../../assets/audio/colormemory/button5.flac";
import greenButtonSound from "../../assets/audio/colormemory/button6.flac";
import purpleButtonSound from "../../assets/audio/colormemory/button7.flac";
import pinkButtonSound from "../../assets/audio/colormemory/button8.flac";
import darkgreenButtonSound from "../../assets/audio/colormemory/button9.flac";
import { ProgressBar } from "../ProgressBar";
import { Hourglass } from "../Hourglass";
import { useAnimate, usePresence, motion, AnimatePresence } from "framer-motion";

const ButtonsColors = ["red", "orange", "yellow", "darkblue", "blue", "green", "purple", "pink", "darkgreen"];

const audioForButtons = [
  new Audio(redButtonSound),
  new Audio(orangeButtonSound),
  new Audio(yellowButtonSound),
  new Audio(darkblueButtonSound),
  new Audio(blueButtonSound),
  new Audio(greenButtonSound),
  new Audio(purpleButtonSound),
  new Audio(pinkButtonSound),
  new Audio(darkgreenButtonSound),
];

interface ColorsMemoryProps {
  roomCode: string;
  users: User[];
  onExit?: () => void;
}

export function ColorsMemory({ users, roomCode, onExit }: ColorsMemoryProps) {
  const round = useRef<number>(0);

  const onceDone = useRef<boolean>(false);

  const [lightButton, setLightButton] = useState<number | null>(null);
  const [isInGame, setIsInGame] = useState<boolean>(false);
  const [isDead, setIsDead] = useState<boolean>(false);
  const [currentClickNumber, setCurrentClickNumber] = useState<number>(0);
  const [time, setTime] = useState<number>(3000);

  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  let sequenceInterval: NodeJS.Timeout;

  const ButtonsSequence = async (array: number[]) => {
    setIsInGame(false);
    round.current++;
    let currentButton = 0;

    sequenceInterval = setInterval(() => {
      if (currentButton < array.length) {
        const newNumber: number = array[currentButton];

        setLightButton(newNumber);
        new Audio(audioForButtons[newNumber].src).play();

        setTimeout(() => {
          setLightButton(null);
        }, 500);

        currentButton++;
      } else {
        setLightButton(null);
        setCurrentClickNumber(0);
        setIsInGame(true);

        clearInterval(sequenceInterval);
      }
    }, 1000);
  };

  useEffect(() => {
    if (onceDone.current) return;

    const host = users.find((user) => user.id == socket.id)?.is_host;

    if (host) {
      socket.emit("startGameColorsMemory", roomCode);
      socket.emit("InitColorsMemory", roomCode);
    }

    onceDone.current = true;
  }, []);

  useEffect(() => {
    if (isInGame && !isDead) {
      const timeInterval = setInterval(async () => {
        if (time > 0) {
          setTime(time - 10);
        } else {
          socket.emit("buttonClickedColorsMemory", roomCode, -1, currentClickNumber);
          clearInterval(timeInterval);
        }
      }, 10);

      return () => clearInterval(timeInterval);
    }
  }, [time, isInGame]);

  useEffect(() => {
    const userDead: boolean = users.find((user) => user.id == socket.id)?.alive || false;
    setIsDead(!userDead);
  }, []);

  useEffect(() => {
    const startGame = () => {
      socket.emit("startGameColorsMemory", roomCode);
    };

    const endGameUser = () => {
      setIsDead(true);
      clearInterval(sequenceInterval);
    };

    socket.on("sequenceColorsMemory", ButtonsSequence);

    socket.on("endRoundColorsMemory", startGame);

    socket.on("endGameUserColorsMemory", endGameUser);

    return () => {
      socket.off("sequenceColorsMemory", ButtonsSequence);
      socket.off("endRoundColorsMemory", startGame);
      socket.off("endGameUserColorsMemory", endGameUser);
    };
  }, [socket]);

  const handleClick = () => {
    const newClicked = currentClickNumber + 1;
    setCurrentClickNumber(newClicked);

    setTime(3000);
  };

  //Show up animation
  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(".colormemory__buttons", { height: [5, 350] }, { duration: 1.6, type: "spring", delay: 0.05 });
        await animate(".colormemory__gamestatus", { opacity: [0, 1], y: [300, 0], display: "flex" }, { duration: 0.8, type: "spring" });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { scale: [1, 0], opacity: [1, 0] }, { duration: 0.8, type: "spring" });
        safeToRemove();
        onExit && onExit();
      };
      exitAnimation();
    }
  }, [isPresence]);

  useEffect(() => {
    users.forEach((user) => {
      if (user.id == socket.id) {
        if (user.alive == false) {
          setIsDead(true);
        }
      }
    });
  }, []);

  return (
    <div className="colormemory" ref={scope}>
      {isDead ? (
        <div className="colormemory__gameover">
          <span className="colormemory__gameover__header">Game over</span>
          <span className="colormemory__gameover__score">Your Record: {round.current} round</span>
          <span className="colormemory__gameover__waiting">
            Waiting for other players
            <div className="colormemory__gameover__waiting__dot">.</div>
            <div className="colormemory__gameover__waiting__dot">.</div>
            <div className="colormemory__gameover__waiting__dot">.</div>
          </span>
          <Hourglass />
        </div>
      ) : (
        <>
          <motion.div className="colormemory__buttons" transition={{ delayChildren: 0.05, staggerChildren: 0.1 }}>
            {ButtonsColors.map((color, index) => (
              <AnimatePresence>
                <Button
                  key={index}
                  id={index}
                  color={color}
                  isLight={lightButton === index}
                  isDisabled={!isInGame}
                  roomCode={roomCode}
                  onClick={handleClick}
                  currentClickNumber={currentClickNumber}
                  audio={audioForButtons[index]}
                />
              </AnimatePresence>
            ))}
          </motion.div>
          <motion.div className="colormemory__gamestatus" initial={{ x: "105%" }}>
            <span>Round: {round.current}</span>
            <span>Score: 1</span>
            <span>Current: {currentClickNumber}</span>
            <ProgressBar max={3000} progress={time} width={"150px"} />
          </motion.div>
        </>
      )}
    </div>
  );
}
