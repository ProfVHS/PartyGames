import { useState } from "react";
import { BattleShipsFieldSpeciality } from "./Types";

interface FieldProps {
  column: string;
  row: number;
  special: BattleShipsFieldSpeciality;
  multiplier?: number;
  onClick?: () => void;
  onHover?: () => void;
  status?: "PREDICTION" | "HIT" | "MISS" | "EMPTY";
}
export const Field = ({
  special,
  multiplier,
  onClick,
  onHover,
  status,
}: FieldProps) => {
  const [isHover, setIsHover] = useState(false);
  const handleHover = () => {
    const newHover = !isHover;
    setIsHover(newHover);
  };

  return (
    <div
      className={`battleships__field ${special} ${status}`}
      onClick={onClick}
      onMouseOver={onHover}
      onMouseOut={handleHover}
    >
      <span className="battleships__field__content">
        {special === "POSITIVE" ||
          (special === "NEGATIVE" && multiplier && multiplier + "x")}
        {special === "LUCKYBLOCK" && "?"}
        {status === "EMPTY" || status === undefined
          ? ""
          : status == "HIT"
          ? "X"
          : status == "MISS"
          ? "o"
          : "?"}
      </span>
    </div>
  );
};
