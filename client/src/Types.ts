// Users and Rooms
export type User = {
  id: string;
  username: string;
  score: number;
  alive: boolean;
  isDisconnected: boolean;
  id_room: string;
  id_selected: number;
  position: number;
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

// Tricky Diamonds
export type TrickyCardColor = "BLUE" | "PURPLE" | "RED";

export type TrickyDiamondType = {
  points: number;
  color: TrickyCardColor;
  isSelected: boolean;
};

// Colors Memory
export type ColorsMemory = "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "brown";

export type awardType = "ctbCLICK" | "firstDeath" | "mostLosedPoints";

export type MedalProps = {
  userID: string;
  username: string;
  points: number;
  award: awardType;
};

export type MinigamesType =
  | "MINIGAMEEND"
  | "LEADERBOARD"
  | "TRICKYDIAMONDS"
  | "COLORSMEMORY"
  | "BUDDIES"
  | "CLICKTHEBOMB"
  | "CARDS"
  | "ENDGAME";
