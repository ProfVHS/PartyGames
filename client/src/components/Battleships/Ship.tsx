import React, { useEffect } from "react";
import { ShipType } from "../../Types";

interface ShipProps {
  ship: ShipType;
}
const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const Ship = ({ ship }: ShipProps) => {
  const startColumnDiff = ship.directionMultiplier === 1 ? 1 : 2;
  const endColumnDiff = ship.directionMultiplier === 1 ? 2 : 1;
  const endRowDiff = ship.directionMultiplier === 1 ? 1 : 0;
  const startRowDiff = ship.directionMultiplier === 1 ? 0 : 1;
  return (
    <div
      className={`battleships__ship`}
      style={{
        gridColumnStart:
          Columns.findIndex((column) => column === ship.startField.column) +
          startColumnDiff,
        gridRowStart: ship.startField.row + startRowDiff,
        gridColumnEnd:
          Columns.findIndex((column) => column === ship.endField?.column) +
          endColumnDiff,
        gridRowEnd: ship.endField.row
          ? ship.endField.row + endRowDiff
          : undefined,
      }}
    ></div>
  );
};
