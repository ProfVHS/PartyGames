import { useEffect, useState } from 'react';
import { socket } from '../../socket';
import { User } from '../../Types';

type AnswersArray = {
  user: string;
  answer: string;
};

interface AnswersSelectProps {
  roomCode: string;
  users: User[];
}

export function AnswersSelect({ roomCode, users }: AnswersSelectProps) {
    const [answers, setAnswers] = useState<AnswersArray[]>([]);
    const [bestAnswer, setBestAnswer] = useState<number>(0);
  
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

    return (
      <>
          <h1>Select the best answer</h1>
          {answers.map((answer, index) => (
            <div key={index} onClick={() => selectTheBestAnswer(index)}>
                {answer.answer}
            </div>
          ))}
          <button onClick={sendTheBestAnswer}>Select</button>
      </>
    )
  }
  