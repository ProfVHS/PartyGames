import { FieldType, PredictionType, ShipType, ShootsType } from "./Types";
import { Field } from "./Field";

interface BattlefieldBoardProps {
  fields: FieldType[];
  yourTeamShoots: ShootsType[];
  setYourTeamShoots: (shoots: ShootsType[]) => void;
  yourTeamPrediction: PredictionType[];
  setYourTeamPrediction: (field: PredictionType[]) => void;
  enemyShips: ShipType[];
  setEnemyShips: (ships: ShipType[]) => void;
}
export function BattlefieldBoard({
  fields,
  yourTeamShoots,
  setYourTeamShoots,
  yourTeamPrediction,
  setYourTeamPrediction,
  enemyShips,
  setEnemyShips,
}: BattlefieldBoardProps) {
  const handleShoot = (field: FieldType) => {
    const newShoot: ShootsType = {
      field: field,
      hit: field.hasShip,
    };

    if (field.hasShip) {
      const newEnemyShips = enemyShips.map((ship) => {
        if (ship.startField.id === field.id || ship.endField?.id === field.id) {
          ship.hittedShipFields++;
        }
        return ship;
      });

      setEnemyShips(newEnemyShips);
    }

    setYourTeamShoots([...yourTeamShoots, newShoot]);
  };

  const handleLeftClick = (field: FieldType) => {
    if (yourTeamShoots.some((shoot) => shoot.field.id === field.id)) return;
    if (yourTeamPrediction.find((prediction) => prediction.field.id === field.id)?.type === "PERMANENT") return;
    if (yourTeamPrediction.some((prediction) => prediction.field.id === field.id)) {
      const newYourTeamPrediction = yourTeamPrediction.filter((prediction) => prediction.type === "PERMANENT");
      setYourTeamPrediction(newYourTeamPrediction);
      handleShoot(field);
      return;
    }
    setYourTeamPrediction([...yourTeamPrediction, { field: field, type: "TEMPORARY" }]);
  };

  const handleRightClick = (field: FieldType) => {
    if (yourTeamShoots.some((shoot) => shoot.field.id === field.id)) return;
    if (yourTeamPrediction.some((prediction) => prediction.field.id === field.id)) {
      const newYourTeamPrediction = yourTeamPrediction.filter((prediction) => prediction.field.id !== field.id);
      setYourTeamPrediction(newYourTeamPrediction);
      return;
    }
    setYourTeamPrediction([...yourTeamPrediction, { field: field, type: "PERMANENT" }]);
  };

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
              onClick={() => handleLeftClick(field)}
              onRightClick={() => handleRightClick(field)}
              status={
                yourTeamPrediction.some((prediction) => prediction.field.id === field.id)
                  ? yourTeamPrediction.find((prediction) => prediction.field.id === field.id)?.type === "PERMANENT"
                    ? "BLANK"
                    : "PREDICTION"
                  : yourTeamShoots.some((shoot) => shoot.field.id === field.id)
                  ? yourTeamShoots.find((shoot) => shoot.field.id === field.id)?.hit === true
                    ? "HIT"
                    : "MISS"
                  : "EMPTY"
              }
            />
          );
        })}
      </div>
    </>
  );
}
