import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { User } from "../../Types";

type AnswersArray = {
  user: string;
  answer: string;
};

interface AnswersSelectProps {
  roomCode: string;
  users: User[];
  user: string;
}

export function AnswersSelect({ roomCode, users, user }: AnswersSelectProps) {
  const [answers, setAnswers] = useState<AnswersArray[]>([]);
  const [bestAnswer, setBestAnswer] = useState<number>(0);
  const [canChooseAnswer, setCanChooseAnswer] = useState<boolean>(false);

  const selectTheBestAnswer = (index: number) => {
    setBestAnswer(index);
  };

  const sendTheBestAnswer = () => {
    socket.emit("sendTheBestAnswerBuddies", roomCode, bestAnswer);
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
    if (user === socket.id) setCanChooseAnswer(true);
  }, []);

  return (
    <>
      <h1 className="buddies__header">Select the best answer</h1>
      <div className="buddies__answers">
        {answers.map((answer, index) => (
          <button
            className="buddies__answers__item"
            key={index}
            onClick={() => selectTheBestAnswer(index)}
            disabled={!canChooseAnswer}>
            {answer.answer}
          </button>
        ))}
      </div>
      {canChooseAnswer && (
        <button className="buddies_button" onClick={sendTheBestAnswer}>
          Select
        </button>
      )}
    </>
  );
}
