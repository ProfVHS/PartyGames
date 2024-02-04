import { FieldType, ShootsType } from "./Types";
import { Field } from "./Field";

interface BattlefieldBoardProps {
  fields: FieldType[];
  yourTeamShoots: ShootsType[];
  setYourTeamShoots: (shoots: ShootsType[]) => void;
  yourTeamPrediction: FieldType[];
  setYourTeamPrediction: (field: FieldType[]) => void;
}
export function BattlefieldBoard({
  fields,
  yourTeamShoots,
  setYourTeamShoots,
  yourTeamPrediction,
  setYourTeamPrediction,
}: BattlefieldBoardProps) {
  const handleShoot = (field: FieldType) => {
    const newShoot: ShootsType = {
      field: field,
      hit: field.hasShip,
    };

    setYourTeamShoots([...yourTeamShoots, newShoot]);
  };

  const handleClick = (field: FieldType) => {
    if (yourTeamShoots.some((shoot) => shoot.field.id === field.id)) return;
    if (yourTeamPrediction.some((prediction) => prediction.id === field.id)) {
      console.log("Shoot");
      setYourTeamPrediction([]);
      handleShoot(field);
      return;
    }
    setYourTeamPrediction([...yourTeamPrediction, field]);
  };
  console.log(yourTeamPrediction);
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
              onClick={() => handleClick(field)}
              status={
                yourTeamPrediction.some(
                  (prediction) => prediction.id === field.id
                )
                  ? "PREDICTION"
                  : yourTeamShoots.some((shoot) => shoot.field.id === field.id)
                  ? yourTeamShoots.find((shoot) => shoot.field.id === field.id)
                      ?.hit === true
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
