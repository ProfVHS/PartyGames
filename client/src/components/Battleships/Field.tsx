import { useState } from "react";
import { BattleShipsFieldSpeciality } from "./Types";

interface FieldProps {
  column: string;
  row: number;
  special: BattleShipsFieldSpeciality;
  multiplier?: number;
  onClick?: () => void;
  onHover?: () => void;
  status?: "PREDICTION" | "HIT" | "MISS" | "EMPTY" | "BLANK";
  onRightClick?: () => void;
}
export const Field = ({ special, multiplier, onClick, onHover, status, onRightClick }: FieldProps) => {
  const [isHover, setIsHover] = useState(false);
  const handleHover = () => {
    const newHover = !isHover;
    setIsHover(newHover);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    if (onRightClick) onRightClick();
  };

  return (
    <div
      className={`battleships__field ${special} ${status}`}
      onClick={onClick}
      onMouseOver={onHover}
      onMouseOut={handleHover}
      onContextMenu={handleContextMenu}>
      <span className="battleships__field__content">
        {special === "POSITIVE" || (special === "NEGATIVE" && multiplier && multiplier + "x")}
        {special === "LUCKYBLOCK" && "?"}
        {status === "EMPTY" || status === undefined
          ? ""
          : status == "HIT"
          ? "X"
          : status == "MISS"
          ? "o"
          : status == "BLANK"
          ? ""
          : "?"}
      </span>
    </div>
  );
};
