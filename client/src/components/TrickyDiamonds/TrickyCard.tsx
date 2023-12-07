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
  const [turnEnd, setTurnEnd] = useState<boolean>(false);

  setTimeout(() => setTurnEnd(true), 2500);
  return (
    <div
      className={`tricky__cards__item ${
        color === selectedColor ? "selected" : ""
      }`}
      onClick={() => handleClick(color)}
    >
      <div className="tricky__cards__item__diamond">
        {color === "BLUE" && <BlueDiamond isCracked={turnEnd} isFake={true} />}
        {color === "PURPLE" && (
          <PurpleDiamond isCracked={turnEnd} isFake={false} />
        )}
        {color === "RED" && <RedDiamond isCracked={turnEnd} isFake={true} />}
      </div>
      {color === selectedColor && !turnEnd && (
        <Shiny className="tricky__cards__item__shiny" />
      )}
      <span className="tricky__cards__item__value">+{points} points</span>
      {color === selectedColor && (
        <span className="tricky__cards__selected">selected</span>
      )}
    </div>
  );
};
