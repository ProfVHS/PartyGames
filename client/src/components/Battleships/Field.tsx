import React from "react";
import { BattleShipsFieldSpeciality } from "../../Types";

interface FieldProps {
  column: string;
  row: number;
  special: BattleShipsFieldSpeciality;
  multiplier?: number;
}
export const Field = ({ special, multiplier }: FieldProps) => {
  return (
    <div className={`battleships__field ${special}`}>
      {special === "POSITIVE" ||
        (special === "NEGATIVE" && multiplier && multiplier + "x")}
      {special === "LUCKYBLOCK" && "?"}
    </div>
  );
};
