import "./TrickyDiamonds.scss";
import { TrickyCard } from "./TrickyCard";
import { useEffect, useState, useRef } from "react";
import { Stopwatch } from "../Stopwatch/Stopwatch";
import { socket } from "../../socket";

import { User } from "../../Types";
interface TrickyDiamondsProps {
  roomCode: string;
  users: User[];
}

//type DiamondsState = 0 | 1 | 2;

export function TrickyDiamonds({roomCode, users} : TrickyDiamondsProps) {
  const [selectedDiamond, setSelectedDiamond] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number[]>([0, 0, 0]);
  const [time, setTime] = useState<number>(5);
  const [endRound, setEndRound] = useState<boolean>(false);

  const onceDone = useRef<boolean>(false);

  const handleClick = (color: number) => {
    const newColor = color;
    setSelectedDiamond(newColor);
    console.log(newColor);
  };

  const startGameDiamonds = () => {
    if(users.length > 0){
      if(users[0].id == socket.id){
        socket.emit("startGameDiamonds", roomCode);
        socket.emit("stopwatchTime", roomCode);
        console.log("startGameDiamonds");
      }
    }
    setEndRound(false);
  };

  useEffect(() => {
    if(onceDone.current) return;
    
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
    if(time == 0){

      if(users.length > 0){
        if(users[0].id == socket.id){
          socket.emit("endRoundDiamonds", roomCode);
        }
      }
      setEndRound(true);
      setTimeout(() => {
        startGameDiamonds();
      }, 3000);
    }
  }, [time]);

  return (
    <div className="tricky">
      <div className="tricky__header">
        <div className="tricky__stopwatch">
          <Stopwatch maxTime={5} timeLeft={time} size={50} />
        </div>
        Round - {round}
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