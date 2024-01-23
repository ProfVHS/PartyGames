import { useState } from "react";
import { BattleShipsFieldSpeciality } from "../../Types";

interface FieldProps {
  column: string;
  row: number;
  special: BattleShipsFieldSpeciality;
  multiplier?: number;
  onClick?: () => void;
  onHover?: () => void;
}
export const Field = ({
  special,
  multiplier,
  onClick,
  onHover,
}: FieldProps) => {
  const [isHover, setIsHover] = useState(false);
  const handleHover = () => {
    const newHover = !isHover;
    setIsHover(newHover);
  };

  return (
    <div
      className={`battleships__field ${special}`}
      onClick={onClick}
      onMouseOver={onHover}
      onMouseOut={handleHover}
    >
      {special === "POSITIVE" ||
        (special === "NEGATIVE" && multiplier && multiplier + "x")}
      {special === "LUCKYBLOCK" && "?"}
    </div>
  );
};
