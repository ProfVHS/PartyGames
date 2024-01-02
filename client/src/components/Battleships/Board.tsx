import { useEffect, useState } from "react";
import { BattleShipsField, ShipType } from "../../Types";
import { Field } from "./Field";
import { Ship } from "./Ship";

export function Board() {
  const Rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  const [fields, setFields] = useState<BattleShipsField[]>([]);

  const [ships, setShips] = useState<ShipType[]>([]);
  const [playerShipLenght, setPlayerShipLenght] = useState<1 | 2>(2);

  const placeShip = (field: BattleShipsField) => {
    const newShip: ShipType = {
      startField: field,
      shipLength: playerShipLenght,
      direction: "vertical",
      directionMultiplier: 1,
      endField: field,
    };
    newShip.endField = endFieldCalculator(newShip);

    const newFields = fields.map((field) => {
      if (
        field.id === newShip.startField.id ||
        field.id === newShip.endField?.id
      ) {
        field.hasShip = true;
      }

      return field;
    });

    console.log(newFields);

    setShips([...ships, newShip]);
    setFields(newFields);

    console.log(newShip);

    setPlayerShipLenght(1);
  };

  const endFieldCalculator = (ship: ShipType) => {
    const endField: BattleShipsField | undefined = fields.find((field) => {
      if (ship.direction === "horizontal") {
        return (
          field.column === ship.startField.column &&
          field.row ===
            ship.startField.row +
              (ship.shipLength - 1) * ship.directionMultiplier
        );
      } else {
        return (
          field.row === ship.startField.row &&
          field.column ===
            Columns[
              Columns.findIndex((column) => column === ship.startField.column) +
                (ship.shipLength - 1) * ship.directionMultiplier
            ]
        );
      }
    });

    return endField ? endField : ship.startField;
  };

  const fieldsRandomizer = () => {
    const newFields: BattleShipsField[] = [];

    Rows.map((row) => {
      Columns.map((column) => {
        newFields.push({
          id: `${column}${row}`,
          column: column,
          row: row,
          speciality: "NORMAL",
          multiplier: 1,
          hasShip: false,
        });
      });
    });

    setFields(newFields);
  };
  useEffect(() => {
    fieldsRandomizer();
  }, []);
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
          {fields.map((field) => {
            if (!field.hasShip)
              return (
                <Field
                  key={field.id}
                  column={field.column}
                  row={field.row}
                  special={field.speciality}
                  multiplier={field.multiplier}
                  onClick={() => placeShip(field)}
                />
              );
          })}
          {ships.map((ship) => (
            <Ship key={ship.startField.id} ship={ship} />
          ))}
        </div>
      </div>
    </>
  );
}
