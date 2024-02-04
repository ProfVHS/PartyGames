import { useEffect, useState } from "react";
import {
  FieldType,
  HologramPositionType,
  ShipType,
  shipDirectionType,
} from "./Types";
import { Field } from "./Field";
import { Ship } from "./Ship";
import { ShipHologram } from "./ShipHologram";

interface PlacingBoardProps {
  fields: FieldType[];
  setFields: (fields: FieldType[]) => void;
  ships: ShipType[];
  setShips: (ships: ShipType[]) => void;
}

export const PlacingBoard = ({
  fields,
  setFields,
  ships,
  setShips,
}: PlacingBoardProps) => {
  const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const playerShipLenght = 2;

  const [haveShipToPlace, setHaveShipToPlace] = useState(true);
  const [canPlaceShip, setCanPlaceShip] = useState(true);

  const [shipDirection, setShipDirection] = useState<shipDirectionType>({
    direction: "vertical",
    directionMultiplier: 1,
  });

  const [hologramPosition, setHologramPosition] =
    useState<HologramPositionType>();

  const placeShip = (field: FieldType) => {
    if (!haveShipToPlace) return;
    if (field.hasShip) return;
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
    setHaveShipToPlace(true);
    blockFieldsAroundShip(field, newShip.endField);
  };

  const blockFieldsAroundBlock = (
    coreField: FieldType,
    fieldsArray: FieldType[]
  ) => {
    const newFields = fieldsArray.map((field) => {
      const CurrentColumnIndex = Columns.findIndex(
        (column) => column === coreField.column
      );

      const middle =
        field.row === coreField.row && field.column === coreField.column;
      const topAndBottom =
        field.column === coreField.column &&
        (field.row === coreField.row + 1 || field.row === coreField.row - 1);
      const middleLeftRight =
        field.row === coreField.row &&
        (field.column === Columns[CurrentColumnIndex + 1] ||
          field.column === Columns[CurrentColumnIndex - 1]);
      const leftTopCorner =
        field.row === coreField.row - 1 &&
        field.column === Columns[CurrentColumnIndex - 1];
      const rightTopCorner =
        field.row === coreField.row - 1 &&
        field.column === Columns[CurrentColumnIndex + 1];
      const rightBottomCorner =
        field.row === coreField.row + 1 &&
        field.column === Columns[CurrentColumnIndex + 1];
      const leftBottomCorner =
        field.row === coreField.row + 1 &&
        field.column === Columns[CurrentColumnIndex - 1];

      if (
        leftTopCorner ||
        rightTopCorner ||
        rightBottomCorner ||
        leftBottomCorner ||
        middleLeftRight ||
        topAndBottom ||
        middle
      ) {
        field.isBlocked = true;
        return field;
      }

      return field;
    });

    return newFields;
  };

  const blockFieldsAroundShip = (
    startField: FieldType,
    endField: FieldType
  ) => {
    let newFields = blockFieldsAroundBlock(startField, fields);
    newFields = blockFieldsAroundBlock(endField, newFields);

    setFields(newFields);
  };

  const hoverHandler = (field: FieldType) => {
    const newShipHologram: ShipType = {
      startField: field,
      shipLength: playerShipLenght,
      direction: shipDirection.direction,
      directionMultiplier: shipDirection.directionMultiplier,
      endField: field,
    };

    newShipHologram.endField = endFieldCalculator(newShipHologram);

    if (field.isBlocked || newShipHologram.endField.isBlocked) {
      setCanPlaceShip(false);
    } else if (canPlaceShip === false) {
      setCanPlaceShip(true);
    }

    if (newShipHologram.startField === newShipHologram.endField) {
      setCanPlaceShip(false);
    }

    setHologramPosition({
      start: newShipHologram.startField,
      end: newShipHologram.endField,
    });
  };

  const endFieldCalculator = (ship: ShipType) => {
    const endField: FieldType | undefined = fields.find((field) => {
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

  // Custom hook for keyboard events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardClick);
    return () => window.removeEventListener("keydown", handleKeyboardClick);
  });

  const handleKeyboardClick = (keyClicked: KeyboardEvent) => {
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
      } else {
        const newShipDirection: shipDirectionType = {
          direction: "vertical",
          directionMultiplier: 1,
        };
        setShipDirection(newShipDirection);
      }
    }
  };

  useEffect(() => {
    if (hologramPosition) {
      hoverHandler(hologramPosition.start);
    }
  }, [shipDirection]);

  return (
    <>
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
        {hologramPosition != undefined && haveShipToPlace && (
          <div className="battleships__hologrid">
            <ShipHologram
              startField={hologramPosition.start}
              shipLength={playerShipLenght}
              shipDirection={shipDirection}
              canPlace={canPlaceShip}
            />
          </div>
        )}
      </div>
    </>
  );
};
