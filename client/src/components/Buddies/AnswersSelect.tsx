import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { User } from "../../Types";
import { QuestionType } from "./Types";

type AnswersArray = {
  user: string;
  answer: string;
};

interface AnswersSelectProps {
  roomCode: string;
  users: User[];
  question: QuestionType;
}

export function AnswersSelect({ roomCode, question }: AnswersSelectProps) {
  const [answers, setAnswers] = useState<AnswersArray[]>([]);
  const [bestAnswerIndex, setBestAnswerIndex] = useState<number>(0);
  const [canChooseAnswer, setCanChooseAnswer] = useState<boolean>(false);

  const selectTheBestAnswer = (index: number) => {
    setBestAnswerIndex(index);
  };

  const sendTheBestAnswer = () => {
    socket.emit("sendTheBestAnswerBuddies", roomCode, bestAnswerIndex);
  };

  useEffect(() => {
    const getAllAnswers = (data: AnswersArray[]) => {
      const temp_answers_array: AnswersArray[] = data;
      setAnswers(temp_answers_array);
    };

    socket.on("receiveAnswersBuddies", getAllAnswers);

    return () => {
      socket.off("receiveAnswersBuddies", getAllAnswers);
    };
  }, [socket]);

  useEffect(() => {
    if (question.author === socket.id) setCanChooseAnswer(true);
  }, []);

  return (
    <>
      <h1 className="buddies__header">{socket.id === question.author ? "Select the best answer" : "Author is choosing the best answer"}</h1>
      <h4 className="buddies__question">
        {question.question}
        {question.question.at(question.question.length - 1) !== "?" && "?"}
      </h4>
      <div className="buddies__answers">
        {answers.map((answer, index) => (
          <button className={`buddies__answers__item ${index === bestAnswerIndex ? "selected" : ""}`} key={index} onClick={() => selectTheBestAnswer(index)} disabled={!canChooseAnswer}>
            {answer.answer}
          </button>
        ))}
      </div>
      {canChooseAnswer && (
        <button className="buddies__button" onClick={sendTheBestAnswer}>
          Select
        </button>
      )}
    </>
  );
}
