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
}

export function ColorsMemory({ users, roomCode }: ColorsMemoryProps) {
  const round = useRef<number>(0);

  const onceDone = useRef<boolean>(false);

  const [lightButton, setLightButton] = useState<number | null>(null);
  const [isInGame, setIsInGame] = useState<boolean>(false);
  const [isDead, setIsDead] = useState<boolean>(false);
  const [currentClickNumber, setCurrentClickNumber] = useState<number>(0);
  const [time, setTime] = useState<number>(3000);

  const ButtonsSequence = async (array: number[]) => {
    setIsInGame(false);
    round.current++;
    let x = 0;

    const sequenceInterval = setInterval(() => {
      if (x < array.length) {
        const newNumber: number = array[x];

        setLightButton(newNumber);
        new Audio(audioForButtons[newNumber].src).play();

        setTimeout(() => {
          setLightButton(null);
        }, 500);

        x++;
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

    if (socket.id == users[0].id) {
      socket.emit("startGameColorsMemory", roomCode);
    }

    onceDone.current = true;
  }, []);

  useEffect(() => {
    if (isInGame && !isDead) {
      const timeInterval = setInterval(() => {
        if (time > 0) {
          setTime(time - 10);
        } else {
          setIsDead(true);
          socket.emit("updateUserAlive", false);
          clearInterval(timeInterval);
        }
      }, 10);

      return () => clearInterval(timeInterval);
    }
  }, [time, isInGame]);

  useEffect(() => {
    const startGame = () => {
      socket.emit("startGameColorsMemory", roomCode);
    };

    const endGameUser = () => {
      setIsDead(true);
    };

    const endGame = () => {
      console.log("end game");
    };

    socket.on("sequenceColorsMemory", ButtonsSequence);

    socket.on("endRoundColorsMemory", startGame);

    socket.on("endGameUserColorsMemory", endGameUser);

    socket.on("endGameColorsMemory", endGame);

    return () => {
      socket.off("sequenceColorsMemory", ButtonsSequence);
      socket.off("endRoundColorsMemory", startGame);
      socket.off("endGameUserColorsMemory", endGameUser);
      socket.off("endGameColorsMemory", endGame);
    };
  }, [socket]);

  const handleClick = () => {
    const newClicked = currentClickNumber + 1;
    setCurrentClickNumber(newClicked);

    setTime(3000);
  };

  return (
    <div className="colormemory">
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
          <div className="colormemory__buttons">
            {ButtonsColors.map((color, index) => (
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
            ))}
          </div>
          <div className="colormemory__gamestatus">
            <span>Round: {round.current}</span>
            <span>Score: 1</span>
            <span>Current: {currentClickNumber}</span>
            <ProgressBar max={3000} progress={time} width={"150px"} />
          </div>
        </>
      )}
    </div>
  );
}
