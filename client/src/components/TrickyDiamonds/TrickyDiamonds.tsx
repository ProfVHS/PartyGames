import "./TrickyDiamonds.scss";
import { TrickyCard } from "./TrickyCard";
import { useState } from "react";
import { Stopwatch } from "../Stopwatch/Stopwatch";
import { Socket } from "socket.io-client";

import { TrickyCardColor } from "../../Types";

interface TrickyDiamondsProps {
  socket: Socket;
  roomCode: string;
}

export function TrickyDiamonds({socket, roomCode} : TrickyDiamondsProps) {
  const [selectedDiamond, setSelectedDiamond] =
    useState<TrickyCardColor | null>(null);

  const handleClick = (color: TrickyCardColor) => {
    const newColor = color;
    setSelectedDiamond(newColor);
    console.log(roomCode);
  };
  return (
    <div className="tricky">
      <div className="tricky__header">
        <div className="tricky__stopwatch">
          <Stopwatch maxTime={10} timeLeft={10} size={50} />
        </div>
        Tricky Diamonds
      </div>
      <div className="tricky__cards">
        <TrickyCard
          points={200}
          color={"BLUE"}
          selectedColor={selectedDiamond}
          handleClick={handleClick}
        />
        <TrickyCard
          points={100}
          color={"PURPLE"}
          selectedColor={selectedDiamond}
          handleClick={handleClick}
        />
        <TrickyCard
          points={50}
          color={"RED"}
          selectedColor={selectedDiamond}
          handleClick={handleClick}
        />
      </div>
    </div>
  );
}
