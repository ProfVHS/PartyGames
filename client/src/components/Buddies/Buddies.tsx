import { Question } from "./Question";
import { Answer } from "./Answer";
import { User } from "../../Types";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { AnswersSelect } from "./AnswersSelect";

import "./style.scss";
import { QuestionType } from "./Types";
import { Hourglass } from "./Hourglass";

interface BuddiesProps {
  roomCode: string;
  users: User[];
}

export function Buddies({ roomCode, users }: BuddiesProps) {
  const [allUsersWrittenQuestion, setAllUsersWrittenQuestion] = useState<number>(0);
  const [allUsersWrittenAnswer, setAllUsersWrittenAnswer] = useState<number>(0);

  const [writtenQuestion, setWrittenQuestion] = useState<boolean>(false);
  const [writtenAnswer, setWrittenAnswer] = useState<boolean>(false);

  const [question, setQuestion] = useState<QuestionType>({ author: "", question: "" });

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
      console.log("data - ", data);
      console.log("every - ", allUsersWrittenAnswer);
    };

    const receiveQuestion = (question: string, user: string) => {
      setQuestion({ author: user, question: question });
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

    socket.on("endGameBuddies", endGameFunction);

    return () => {
      socket.off("allQuestionsBuddies", isEveryUserHasQuestion);
      socket.off("allAnswersBuddies", isEveryUserHasAnswer);
      socket.off("receiveQuestionBuddies", receiveQuestion);
      socket.off("newRoundBuddies", newRound);
      socket.off("endGameBuddies", endGameFunction);
    };
  }, [socket]);

  useEffect(() => {
    if (allUsersWrittenQuestion === users.length) {
      if (socket.id === users[0].id) {
        socket.emit("getQuestionsBuddies", roomCode);
      }
    }
    if (allUsersWrittenAnswer === users.length - 1) {
      if (socket.id === users[0].id) {
        socket.emit("getAnswersBuddies", roomCode);
      }
    }
  }, [allUsersWrittenQuestion, allUsersWrittenAnswer]);

  return (
    <div className="buddies">
      {endGame ? (
        <h1>End Game</h1>
      ) : !writtenQuestion ? (
        <Question roomCode={roomCode} users={users} onClick={isQuestionWritten} />
      ) : allUsersWrittenQuestion !== users.length ? (
        <>
          <h3 className="buddies__waiting">Waiting for all players to ask the questions</h3>
          <Hourglass />
        </>
      ) : writtenAnswer || socket.id === question.author ? (
        allUsersWrittenAnswer !== users.length - 1 ? (
          <>
            <h3 className="buddies__waiting">Waiting for all players to answer</h3>
            <Hourglass />
          </>
        ) : (
          <AnswersSelect roomCode={roomCode} users={users} question={question} />
        )
      ) : (
        <Answer roomCode={roomCode} users={users} onClick={isAnswerWritten} question={question} />
      )}
    </div>
  );
}
