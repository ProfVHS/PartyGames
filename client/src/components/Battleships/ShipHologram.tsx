import { useEffect, useState } from "react";
import { FieldType, shipDirectionType } from "./Types";

const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

interface ShipHologramProps {
  //holoRotate: "0deg" | "90deg" | "180deg" | "270deg";
  startField: FieldType;
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
  const [ColumnDiff, setColumnDiff] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });
  const [RowDiff, setRowDiff] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const leftOrUp = -1;
  const rightOrDown = 1;
  const hologramDirection = shipDirection.directionMultiplier;

  useEffect(() => {
    if (shipDirection.direction === "vertical") {
      const newRowDiff = {
        start: hologramDirection === 1 ? 0 : -1,
        end: hologramDirection === 1 ? 2 : 1,
      };
      const newColumnDiff = {
        start: 1,
        end: 1,
      };

      if (hologramDirection === leftOrUp) {
        if (startField.row === 1) {
          newRowDiff.start = 0;
          newRowDiff.end = 1;
        }
      } else if (hologramDirection === rightOrDown) {
        if (startField.row === 10) {
          newRowDiff.start = 0;
          newRowDiff.end = 1;
        }
      }

      setRowDiff(newRowDiff);
      setColumnDiff(newColumnDiff);
      return;
    }

    if (shipDirection.direction === "horizontal") {
      const newColumnDiff = {
        start: hologramDirection === 1 ? 1 : 0,
        end: hologramDirection === 1 ? 3 : 2,
      };

      const newRowDiff = {
        start: 0,
        end: 0,
      };

      if (hologramDirection === leftOrUp) {
        if (Columns.indexOf(startField.column) + newColumnDiff.start === 0) {
          newColumnDiff.start = 1;
          newColumnDiff.end = 1;
        }
      } else if (hologramDirection === rightOrDown) {
        if (Columns.indexOf(startField.column) + 1 === Columns.length) {
          newColumnDiff.start = 1;
          newColumnDiff.end = 1;
        }
      }

      setColumnDiff(newColumnDiff);
      setRowDiff(newRowDiff);
      return;
    }
  }, [startField, shipDirection, shipLength]);

  return (
    <div
      className={`battleships__hologram ${canPlace ? "" : "cantPlace"}`}
      style={{
        rotate: "0deg",
        gridRow:
          startField.row + RowDiff.start + "/" + (startField.row + RowDiff.end),
        gridColumn:
          Columns.indexOf(startField.column) +
          ColumnDiff.start +
          "/" +
          (Columns.indexOf(startField.column) + ColumnDiff.end),
      }}
    />
  );
};
