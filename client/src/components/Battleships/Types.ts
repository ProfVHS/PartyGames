/* Battleship */

export type BattleShipsFieldSpeciality =
  | "NORMAL"
  | "POSITIVE"
  | "NEGATIVE"
  | "LUCKYBLOCK";

export type FieldType = {
  id: string;
  speciality: BattleShipsFieldSpeciality;
  multiplier: number;
  column: string;
  row: number;
  hasShip: boolean;
  isBlocked: boolean;
};

export type ShipType = {
  startField: FieldType;
  shipLength: 1 | 2;
  direction: "horizontal" | "vertical";
  directionMultiplier: 1 | -1;
  endField: FieldType;
};

export type shipDirectionType = {
  direction: "vertical" | "horizontal";
  directionMultiplier: 1 | -1;
};

export type HologramPositionType = {
  start: FieldType;
  end: FieldType;
};

export type turnType = "YOUR" | "ENEMY" | "PLACING";

export type ShootsType = {
  field: FieldType;
  hit: boolean;
};
