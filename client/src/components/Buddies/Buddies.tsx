import { Question } from "./Question";
import { Answer } from "./Answer";
import { User } from "../../Types";
import { useEffect, useState } from "react";
import { socket } from "../../socket";

interface BuddiesProps {
    roomCode: string;
    users: User[];
}

export function Buddies({roomCode, users}: BuddiesProps) {
    const [usersReady, setUsersReady] = useState<number>(0);
    const [writtenQuestion, setWrittenQuestion] = useState<boolean>(false);

    const isQuestionWritten = () => {
        setWrittenQuestion(true);
    };

    useEffect(() => {
        const isGameReady = (data: number) => {
            setUsersReady(data);
        };

        socket.on("allQuestionsBuddies", isGameReady);

        return () => {
            socket.off("allQuestionsBuddies", isGameReady);
        };
    }, [socket]);

    return (
        <>

            {writtenQuestion 
            ? usersReady === users.length 
            ? <Answer roomCode={roomCode} users={users} /> 
            : <h1>Waiting for all players to ask questions</h1> 
            : <Question roomCode={roomCode} users={users} onClick={isQuestionWritten} />}
        </>
    )
}
