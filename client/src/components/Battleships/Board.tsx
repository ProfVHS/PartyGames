import { useEffect, useState } from "react";
import { BattleShipsField, ShipType, shipDirectionType } from "../../Types";
import { Field } from "./Field";
import { Ship } from "./Ship";
import { ShipHologram } from "./ShipHologram";

export function Board() {
  const Rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  const [fields, setFields] = useState<BattleShipsField[]>([]);

  const [ships, setShips] = useState<ShipType[]>([]);
  const [playerShipLenght, setPlayerShipLenght] = useState<1 | 2>(2);
  const [canPlaceShip, setCanPlaceShip] = useState(true);

  const [shipDirection, setShipDirection] = useState<shipDirectionType>({
    direction: "vertical",
    directionMultiplier: 1,
  });

  type HologramPositionType = {
    start: BattleShipsField;
    end: BattleShipsField;
  };
  const [hologramPosition, setHologramPosition] =
    useState<HologramPositionType>();

  const placeShip = (field: BattleShipsField) => {
    if (!canPlaceShip) return;
    const newShip: ShipType = {
      startField: field,
      shipLength: playerShipLenght,
      direction: shipDirection.direction,
      directionMultiplier: shipDirection.directionMultiplier,
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

    setShips([...ships, newShip]);
    setFields(newFields);
    setCanPlaceShip(false);

    //setPlayerShipLenght(1);
  };

  const hoverHandler = (field: BattleShipsField) => {
    const newShipHologram: ShipType = {
      startField: field,
      shipLength: playerShipLenght,
      direction: shipDirection.direction,
      directionMultiplier: shipDirection.directionMultiplier,
      endField: field,
    };

    newShipHologram.endField = endFieldCalculator(newShipHologram);

    setHologramPosition({
      start: newShipHologram.startField,
      end: newShipHologram.endField,
    });
  };

  const endFieldCalculator = (ship: ShipType) => {
    const endField: BattleShipsField | undefined = fields.find((field) => {
      if (ship.direction === "vertical") {
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

  // Custom hook for keyboard events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardClick);
    return () => window.removeEventListener("keydown", handleKeyboardClick);
  });

  const handleKeyboardClick = (keyClicked: React.KeyboardEvent) => {
    const { key, repeat } = keyClicked;
    if (repeat === true) return;
    if (key !== "r") return;
    handleRotate();
  };

  useEffect(() => {
    if (hologramPosition) {
      const newShipHologram: ShipType = {
        startField: hologramPosition.start,
        shipLength: playerShipLenght,
        direction: shipDirection.direction,
        directionMultiplier: shipDirection.directionMultiplier,
        endField: hologramPosition.end,
      };
      newShipHologram.endField = endFieldCalculator(newShipHologram);
    }
  }, [shipDirection]);

  const handleRotate = () => {
    if (shipDirection.direction === "vertical") {
      if (shipDirection.directionMultiplier === 1) {
        const newShipDirection: shipDirectionType = {
          direction: "horizontal",
          directionMultiplier: 1,
        };
        setShipDirection(newShipDirection);
        if (hologramPosition) hoverHandler(hologramPosition.start);
        return;
      } else {
        const newShipDirection: shipDirectionType = {
          direction: "horizontal",
          directionMultiplier: -1,
        };
        setShipDirection(newShipDirection);
        if (hologramPosition) hoverHandler(hologramPosition.start);
        return;
      }
    }

    if (shipDirection.direction === "horizontal") {
      if (shipDirection.directionMultiplier === 1) {
        const newShipDirection: shipDirectionType = {
          direction: "vertical",
          directionMultiplier: -1,
        };
        setShipDirection(newShipDirection);
        if (hologramPosition) hoverHandler(hologramPosition.start);
        return;
      } else {
        const newShipDirection: shipDirectionType = {
          direction: "vertical",
          directionMultiplier: 1,
        };
        setShipDirection(newShipDirection);
        if (hologramPosition) hoverHandler(hologramPosition.start);
        return;
      }
    }
  };

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
                  onHover={() => hoverHandler(field)}
                />
              );
          })}
          {ships.map((ship) => (
            <Ship key={ship.startField.id} ship={ship} />
          ))}
          {hologramPosition != undefined && canPlaceShip && (
            <div className="battleships__hologrid">
              <ShipHologram
                startField={hologramPosition.start}
                shipLength={playerShipLenght}
                shipDirection={shipDirection}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
