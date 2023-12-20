import { useState } from "react";
import { BlueDiamond, PurpleDiamond, RedDiamond } from "./Diamonds";
import { Shiny } from "./Shiny";
import { TrickyCardColor } from "../../Types";

interface TrickyCard {
  id: number;
  points: number;
  color: TrickyCardColor;
  selectedColor: number | null;
  handleClick: (color: number) => void;
  turnEnded: boolean;
}

export const TrickyCard = ({
  id,
  points,
  color,
  selectedColor,
  handleClick,
  turnEnded,
}: TrickyCard) => {


  return (
    <div
      className={`tricky__cards__item ${
        id === selectedColor ? "selected" : ""
      }`}
      onClick={() => handleClick(id)}
    >
      <div className="tricky__cards__item__diamond">
        {color === "BLUE" && <BlueDiamond isCracked={turnEnded} isFake={false} />}
        {color === "PURPLE" && <PurpleDiamond isCracked={turnEnded} isFake={false} />}
        {color === "RED" && <RedDiamond isCracked={turnEnded} isFake={false} />}
      </div>
      {id === selectedColor && !turnEnded && (<Shiny className="tricky__cards__item__shiny" />)}
      <span className="tricky__cards__item__value">+{points} points</span>
      {id === selectedColor && (<span className="tricky__cards__selected">selected</span>)}
    </div>
  );
};