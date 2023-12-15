export type User = {
    id: string,
    username: string,
    score: number,
    alive: boolean,
    id_room: string
};

export type Room = {
    id: string,
    turn: number,
    ready: number,
    time_left: number,
    time_max: number,
    in_game: boolean,
};