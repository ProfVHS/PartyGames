// Users and Rooms
export type User = {
  id: string;
  username: string;
  score: number;
  alive: boolean;
  id_room: string;
  id_selected: number;
};

export type Room = {
  id: string;
  turn: number;
  ready: number;
  time_left: number;
  time_max: number;
  in_game: boolean;
  round: number;
};

// Click the bomb
export type CtbProps = {
  roomCode: string;
  users: User[];
};

// Cards

// Tricky Diamonds
export type TrickyCardColor = "BLUE" | "PURPLE" | "RED";

export type TrickyDiamondType = {
  points: number;
  color: TrickyCardColor;
  isSelected: boolean;
};

/* Battleship */

export type BattleShipsFieldSpeciality =
  | "NORMAL"
  | "POSITIVE"
  | "NEGATIVE"
  | "LUCKYBLOCK";

export type BattleShipsField = {
  id: string;
  speciality: BattleShipsFieldSpeciality;
  multiplier: number;
  column: string;
  row: number;
  hasShip: boolean;
};

export type ShipType = {
  startField: BattleShipsField;
  shipLength: 1 | 2;
  direction: "horizontal" | "vertical";
  directionMultiplier: 1 | -1;
  endField: BattleShipsField;
};
