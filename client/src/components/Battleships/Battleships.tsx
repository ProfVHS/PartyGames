import "./style.scss";
import { useEffect, useState } from "react";
import { FieldType, ShootsType, ShipType, turnType } from "./Types";

import { BattlefieldBoard } from "./BattlefieldBoard";
import { Marks } from "./Marks";
import { PlacingBoard } from "./PlacingBoard";
import { EnemyAttackBoard } from "./EnemyAttackBoard";

export function Battleships() {
  const Rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const [turn, setTurn] = useState<turnType>("PLACING");

  const [fields, setFields] = useState<FieldType[]>([]);
  const [ships, setShips] = useState<ShipType[]>([]);
  const [yourShoots, setYourShoots] = useState<ShootsType[]>([]);

  const [yourTeamPredictions, setYourTeamPredictions] = useState<FieldType[]>(
    []
  );

  const [enemyTeamPrediction, setEnemyTeamPrediction] = useState<FieldType[]>(
    []
  );
  const [enemyTeamShoots, setEnemyTeamShoots] = useState<ShootsType[]>([]);

  const turnMessage = {
    YOUR: "Your team's turn. Make your move!",
    ENEMY: "Enemy's turn. Wait for your turn!",
    PLACING: "Place your battleships!",
  };

  // Delete this function and make a new one but on server side to randomize fields for all players
  // Speciality can be "NORMAL", "POSITIVE", "NEGATIVE", "LUCKYBLOCK"
  // hasShip is for checking if field has a ship, default make it false
  // isBlocked is for checking if field is blocked, default make it false

  const fieldsRandomizer = () => {
    const newFields: FieldType[] = [];

    Rows.map((row) => {
      Columns.map((column) => {
        newFields.push({
          id: `${column}${row}`,
          column: column,
          row: row,
          speciality: "NORMAL",
          multiplier: 1,
          hasShip: false,
          isBlocked: false,
        });
      });
    });

    setFields(newFields);
  };

  // make a if statement to check if all players placed their ships in placing phase and then change turn to "YOUR" or "ENEMY" depending on the team of the player
  // make a if statement to check if team with turn "YOUR" made his move and then use turnHandler for all players

  const turnHandler = () => {
    if (turn === "PLACING") {
      setTurn("YOUR");
    } else if (turn === "YOUR") {
      setTurn("ENEMY");
    } else if (turn === "ENEMY") {
      setTurn("YOUR");
    }
  };

  useEffect(() => {
    fieldsRandomizer();
  }, []);

  // Change enemyTeamPrediction and enemyTeamShoots values to be correct.
  return (
    <div className="battleships">
      <span className="battleships__title">Battleships</span>
      <span className="battleships__turn">{turnMessage[turn]}</span>
      <div className="battleships__board">
        <Marks />
        {turn === "YOUR" && (
          <BattlefieldBoard
            fields={fields}
            yourTeamShoots={yourShoots}
            setYourTeamShoots={setYourShoots}
            yourTeamPrediction={yourTeamPredictions}
            setYourTeamPrediction={setYourTeamPredictions}
          />
        )}
        {turn === "ENEMY" && (
          <EnemyAttackBoard
            fields={fields}
            ships={ships}
            enemyTeamPrediction={yourTeamPredictions}
            setEnemyTeamPrediction={setYourTeamPredictions}
            enemyTeamShoots={yourShoots}
            setEnemyTeamShoots={setYourShoots}
          />
        )}
        {turn === "PLACING" && (
          <PlacingBoard
            fields={fields}
            setFields={setFields}
            ships={ships}
            setShips={setShips}
          />
        )}
      </div>
      {/* Temporary button for testing purposes, delete it after making a socket to operate turns */}
      <button onClick={turnHandler} className="battleships__turnButton">
        Next Turn
      </button>
    </div>
  );
}
