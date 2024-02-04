import { useEffect, useState } from "react";
import { FieldType, ShipType, ShootsType } from "./Types";
import { Field } from "./Field";
import { Ship } from "./Ship";
import { ShipHologram } from "./ShipHologram";

interface PlacingBoardProps {
  fields: FieldType[];
  ships: ShipType[];
  enemyTeamShoots: ShootsType[];
  setEnemyTeamShoots: (shoots: ShootsType[]) => void;
  enemyTeamPrediction: FieldType[];
  setEnemyTeamPrediction: (field: FieldType[]) => void;
}

export const EnemyAttackBoard = ({
  fields,
  ships,
  enemyTeamPrediction,
  enemyTeamShoots,
}: PlacingBoardProps) => {
  return (
    <>
      <div className="battleships__fields">
        {fields.map((field) => {
          return (
            <Field
              key={field.id}
              column={field.column}
              row={field.row}
              special={field.speciality}
              multiplier={field.multiplier}
              status={
                enemyTeamPrediction.some(
                  (prediction) => prediction.id === field.id
                )
                  ? "PREDICTION"
                  : enemyTeamShoots.some((shoot) => shoot.field.id === field.id)
                  ? enemyTeamShoots.find((shoot) => shoot.field.id === field.id)
                      ?.hit === true
                    ? "HIT"
                    : "MISS"
                  : "EMPTY"
              }
            />
          );
        })}
        <div className="battleships__hologrid">
          {ships.map((ship, key) => (
            <ShipHologram
              key={key}
              startField={ship.startField}
              shipLength={ship.shipLength}
              shipDirection={{
                direction: ship.direction,
                directionMultiplier: ship.directionMultiplier,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
