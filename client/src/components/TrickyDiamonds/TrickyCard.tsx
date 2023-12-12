import { useEffect, useState } from "react";
import { BlueDiamond, PurpleDiamond, RedDiamond } from "./Diamonds";
import { Shiny } from "./Shiny";

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
      <div className="tricky__cards__item__diamond">
        {color === "BLUE" && (
          <BlueDiamond isCracked={color === selectedColor} />
        )}
        {color === "PURPLE" && (
          <PurpleDiamond isCracked={color === selectedColor} />
        )}
        {color === "RED" && <RedDiamond />}
        {color === selectedColor && (
          <Shiny className="tricky__cards__item__shiny" />
        )}
      </div>
      <span className="tricky__cards__item__value">+{points} points</span>
      {color === selectedColor && (
        <span className="tricky__cards__selected">selected</span>
      )}
    </div>
  );
};
