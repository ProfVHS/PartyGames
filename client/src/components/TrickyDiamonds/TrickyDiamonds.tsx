import "./TrickyDiamonds.scss";
import { TrickyCard } from "./TrickyCard";
import { useState } from "react";
import Stopwatch from "../Stopwatch";

export function TrickyDiamonds() {
  const [selectedDiamond, setSelectedDiamond] =
    useState<TrickyCardColor | null>(null);

  const handleClick = (color: TrickyCardColor) => {
    const newColor = color;
    setSelectedDiamond(newColor);
  };
  console.log(selectedDiamond);
  return (
    <div className="tricky">
      <div className="tricky__header">Tricky Diamonds</div>
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
