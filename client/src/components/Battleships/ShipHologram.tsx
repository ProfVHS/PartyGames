import { useEffect, useState } from "react";
import { BattleShipsField, shipDirectionType } from "../../Types";

const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

interface ShipHologramProps {
  //holoRotate: "0deg" | "90deg" | "180deg" | "270deg";
  startField: BattleShipsField;
  shipDirection: shipDirectionType;
  shipLength: number;
  canPlace: boolean;
}

export const ShipHologram = ({
  startField,
  shipDirection,
  shipLength,
  canPlace,
}: ShipHologramProps) => {
  // const startColumnDiff = shipDirection.directionMultiplier === 1 ? 1 : 2;
  // // const endColumnDiff = shipDirection.directionMultiplier === 1 ? 2 : 1;
  // const startRowDiff = shipDirection.directionMultiplier === 1 ? 0 : 1;
  // const endRowDiff = shipDirection.directionMultiplier === 1 ? 1 : 0;
  const [ColumnDiff, setColumnDiff] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });
  const [RowDiff, setRowDiff] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });
  useEffect(() => {
    if (shipDirection.direction === "vertical") {
      const newRowDiff = {
        start: shipDirection.directionMultiplier === 1 ? 0 : -1,
        end: shipDirection.directionMultiplier === 1 ? 2 : 1,
      };
      const newColumnDiff = {
        start: 1,
        end: 1,
      };
      setRowDiff(newRowDiff);
      setColumnDiff(newColumnDiff);
    }

    if (shipDirection.direction === "horizontal") {
      const newColumnDiff = {
        start: shipDirection.directionMultiplier === 1 ? 1 : 0,
        end: shipDirection.directionMultiplier === 1 ? 3 : 2,
      };
      const newRowDiff = {
        start: 0,
        end: 1,
      };
      setColumnDiff(newColumnDiff);
      setRowDiff(newRowDiff);
    }
  }, [shipDirection]);
  return (
    <div
      className={`battleships__hologram ${canPlace ? "" : "cantPlace"}`}
      style={{
        rotate: "0deg",
        gridRow:
          startField.row + RowDiff.start + "/" + (startField.row + RowDiff.end),
        gridColumn:
          Columns.indexOf(startField.column) +
          ColumnDiff?.start +
          "/" +
          (Columns.indexOf(startField.column) + ColumnDiff?.end),
      }}
    />
  );
};
