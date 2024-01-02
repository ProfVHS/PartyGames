import React from "react";
import { ShipType } from "../../Types";

interface ShipProps {
  ship: ShipType;
}
const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const Ship = ({ ship }: ShipProps) => {
  return (
    <div
      className={`battleships__ship`}
      style={{
        gridColumnStart:
          Columns.findIndex((column) => column === ship.startField.column) + 1,
        gridRowStart: ship.startField.row,
        gridColumnEnd:
          Columns.findIndex((column) => column === ship.endField?.column) + 2,
        gridRowEnd: ship.endField.row ? ship.endField.row + 1 : undefined,
      }}
    ></div>
  );
};
