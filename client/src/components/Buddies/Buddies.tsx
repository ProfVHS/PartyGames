import { Question } from "./Question";
import { Answer } from "./Answer";
import { User } from "../../Types";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { AnswersSelect } from "./AnswersSelect";

interface BuddiesProps {
    roomCode: string;
    users: User[];
}


export function Buddies({roomCode, users}: BuddiesProps) {
    const [allUsersWrittenQuestion, setAllUsersWrittenQuestion] = useState<number>(0);
    const [allUsersWrittenAnswer, setAllUsersWrittenAnswer] = useState<number>(0);

    const [writtenQuestion, setWrittenQuestion] = useState<boolean>(false);
    const [writtenAnswer, setWrittenAnswer] = useState<boolean>(false);

    const isQuestionWritten = () => {
        setWrittenQuestion(true);
    };

    const isAnswerWritten = () => {
        setWrittenAnswer(true);
    };

    useEffect(() => {
        const isEveryUserHasQuestion = (data: number) => {
            setAllUsersWrittenQuestion(data);
        };

        const isEveryUserHasAnswer = (data: number) => {
            setAllUsersWrittenAnswer(data);
        };

        socket.on("allQuestionsBuddies", isEveryUserHasQuestion);

        socket.on("allAnswersBuddies", isEveryUserHasAnswer);        

        return () => {
            socket.off("allQuestionsBuddies", isEveryUserHasQuestion);
            socket.off("allAnswersBuddies", isEveryUserHasAnswer);
            
        };
    }, [socket]);

    useEffect(() => {
        if(allUsersWrittenQuestion === users.length){
            if(socket.id === users[0].id){
                socket.emit("getQuestionsBuddies", roomCode);
            }
        }
    }, [allUsersWrittenQuestion]);

    return (
        <>
            {!writtenQuestion 
            ? <Question roomCode={roomCode} users={users} onClick={isQuestionWritten} />
            : allUsersWrittenQuestion !== users.length 
                ? <h3>Waiting for all players to ask questions</h3>
                : writtenAnswer
                ? allUsersWrittenAnswer !== users.length
                    ? <h3>Waiting for all players to answer</h3>
                    : <AnswersSelect />
                : <Answer roomCode={roomCode} users={users} onClick={isAnswerWritten} /> }
        </>
    )
}