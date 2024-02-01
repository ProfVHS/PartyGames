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

    const [question, setQuestion] = useState<string>("");
    const [whowroteQuestion, setWhowroteQuestion] = useState<string>("");

    const [endGame, setEndGame] = useState<boolean>(false);

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
            const temp = data;
            setAllUsersWrittenAnswer(temp);
            console.log("data - ",data);
            console.log("every - ", allUsersWrittenAnswer);
        };

        const receiveQuestion = (question: string, user: string) => {
            setQuestion(question);
            setWhowroteQuestion(user);
          };

        const newRound = () => {
            setAllUsersWrittenAnswer(0);
            setWrittenAnswer(false);
        };

        const endGameFunction = () => {
            setEndGame(true);
        };

        socket.on("allQuestionsBuddies", isEveryUserHasQuestion);

        socket.on("allAnswersBuddies", isEveryUserHasAnswer);        

        socket.on("receiveQuestionBuddies", receiveQuestion);

        socket.on("newRoundBuddies", newRound);

        socket.on("endGameBuddies", endGameFunction)

        return () => {
            socket.off("allQuestionsBuddies", isEveryUserHasQuestion);
            socket.off("allAnswersBuddies", isEveryUserHasAnswer);
            socket.off("receiveQuestionBuddies", receiveQuestion);
            socket.off("newRoundBuddies", newRound);
            socket.off("endGameBuddies", endGameFunction);
        };
    }, [socket]);

    useEffect(() => {
        if(allUsersWrittenQuestion === users.length){
            if(socket.id === users[0].id){
                socket.emit("getQuestionsBuddies", roomCode);
            }
        }
        if(allUsersWrittenAnswer === users.length-1){
            if(socket.id === users[0].id){
                socket.emit("getAnswersBuddies", roomCode);
            }
        }
    }, [allUsersWrittenQuestion, allUsersWrittenAnswer]);

    return (
        <>
            {endGame
            ? <h1>End Game</h1> 
            : !writtenQuestion 
                ? <Question roomCode={roomCode} users={users} onClick={isQuestionWritten} />
                : allUsersWrittenQuestion !== users.length 
                    ? <h3>Waiting for all players to ask questions</h3>
                    : writtenAnswer || socket.id === whowroteQuestion
                    ? allUsersWrittenAnswer !== users.length-1
                        ? <h3>Waiting for all players to answer</h3>
                        : <AnswersSelect roomCode={roomCode} users={users} user={whowroteQuestion} />
                    : <Answer roomCode={roomCode} users={users} onClick={isAnswerWritten} question={question} user={whowroteQuestion} /> }
        </>
    )
}
