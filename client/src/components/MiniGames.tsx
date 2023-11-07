import { Socket } from "socket.io-client"
import Leaderboard from "./Leaderboard";
import { useState } from "react";
import Ctb from "./Ctb";

interface MiniGamesProps {
    socket: Socket;
    users: {id: string, username: string, score: number, id_room: string}[];
};

export default function MiniGames( { }: MiniGamesProps) {
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
    const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);
    
    const [isEndGame, setIsEndGame] = useState<boolean>(false);


    const allGames = [1,2,3,4,5,6,7,8,9,10]; // all
    const currentGames = [1,5,4,2,1]; // 1-Ctb, 2-Diamond, ...

    const [currentGame, setCurrentGame] = useState<number>(currentGames[0]);

    setTimeout(() => {
        setIsLoadingLeaderboard(false);
        setIsLoadingGame(true);
    }, 5000);

    const switchGame = (currentGame: number) => {
        switch(currentGame){
            case 1: 
                return <Ctb turn="monke" />
            case 2:
                return <div>Gra 2</div>  
            case 3:
                return <div>Gra 3</div>
            default:
                return <div>Error</div>;
        }
    }

    // server-side : socket.emit(;end-game', roomCode )
    return (
    <>
        {switchGame(currentGame)}
    </>
  )
}
