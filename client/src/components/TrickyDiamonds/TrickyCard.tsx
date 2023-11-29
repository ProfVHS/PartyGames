import { useEffect, useState } from "react";
import { BlueDiamond, PurpleDiamond, RedDiamond } from "./Diamonds";

interface TrickyCard {
  points: number;
  color: TrickyCardColor;
  selectedColor: TrickyCardColor | null;
  handleClick: (color: TrickyCardColor) => void;
}

export const TrickyCard = ({
  points,
  color,
  selectedColor,
  handleClick,
}: TrickyCard) => {
  return (
    <div
      className={`tricky__cards__item ${
        color === selectedColor ? "selected" : ""
      }`}
      onClick={() => handleClick(color)}
    >
      {color === "BLUE" && <BlueDiamond />}
      {color === "PURPLE" && <PurpleDiamond />}
      {color === "RED" && <RedDiamond />}
      <span>+{points} points</span>
      {color === selectedColor && (
        <span className="tricky__cards__selected">selected</span>
      )}
    </div>
  );
};
