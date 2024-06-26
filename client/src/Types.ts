// Users and Rooms
export type User = {
  id: string;
  username: string;
  score: number;
  alive: boolean;
  is_disconnect: boolean;
  id_room: string;
  id_selected: number;
  game_position: number;
  is_host: boolean;
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

export type MedalsType = "MostBombClicks" | "LowestBalanceAfterCardGame" | "BestRoundInColorsMemory" | "MostFiguredOutDiamonds" | "MostBestAnswersInBuddies";

export type MedalProps = {
  userID: string;
  username: string;
  points: number;
  award: MedalsType;
};

export type MinigamesType = "SOLOINROOM" | "MINIGAMEEND" | "LEADERBOARD" | "LEADERBOARDGAME" | "TRICKYDIAMONDS" | "COLORSMEMORY" | "BUDDIES" | "CLICKTHEBOMB" | "CARDS" | "ENDGAME";

export type LeaderboardGameUser = {
  username: string;
  scoreToAdd: number | null;
  record: number;
};
