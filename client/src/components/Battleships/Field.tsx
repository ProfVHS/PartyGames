import React from "react";
import { BattleShipsFieldSpeciality } from "../../Types";
import { ShipHologram } from "./ShipHologram";

interface FieldProps {
  column: string;
  row: number;
  special: BattleShipsFieldSpeciality;
  multiplier?: number;
  onClick?: () => void;
}
export const Field = ({ special, multiplier, onClick }: FieldProps) => {
  return (
    <div className={`battleships__field ${special}`} onClick={onClick}>
      {special === "POSITIVE" ||
        (special === "NEGATIVE" && multiplier && multiplier + "x")}
      {special === "LUCKYBLOCK" && "?"}
      <ShipHologram />
    </div>
  );
};
