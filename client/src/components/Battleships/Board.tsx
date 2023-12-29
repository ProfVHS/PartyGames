import { useEffect, useState } from "react";
import { BattleShipsField } from "../../Types";
import { Field } from "./Field";

export function Board() {
  const Rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  const [fields, setFields] = useState<BattleShipsField[][]>([]);

  const fieldsRandomizer = () => {
    const newFields: BattleShipsField[][] = [];

    Rows.map((row) => {
      const newRow: BattleShipsField[] = [];
      Columns.map((column) => {
        newRow.push({
          id: `${column}${row}`,
          column: column,
          row: row,
          speciality: "NORMAL",
          multiplier: 1,
        });
      });
      newFields.push(newRow);
    });

    setFields(newFields);
  };
  useEffect(() => {
    fieldsRandomizer();
  }, []);
  console.log(fields);
  return (
    <>
      <div className="battleships__board">
        <div className="battleships__columns">
          {Columns.map((column) => {
            return (
              <div key={column} className="battleships__column">
                {column}
              </div>
            );
          })}
        </div>
        <div className="battleships__rows">
          {Rows.map((rows) => {
            return (
              <div key={rows} className="battleships__row">
                {rows}
              </div>
            );
          })}
        </div>
        <div className="battleships__fields">
          {fields.map((row) => {
            return row.map((field) => {
              return (
                <Field
                  key={field.id}
                  column={field.column}
                  row={field.row}
                  special={field.speciality}
                  multiplier={field.multiplier}
                />
              );
            });
          })}
        </div>
      </div>
    </>
  );
}
