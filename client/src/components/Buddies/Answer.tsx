import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { User } from "../../Types";
import { QuestionType } from "./Types";

interface AnswerProps {
  roomCode: string;
  users: User[];
  onClick: () => void;
  question: QuestionType;
}

export function Answer({ roomCode, onClick, question }: AnswerProps) {
  const [answer, setAnswer] = useState<string>("");

  const sendAnswer = () => {
    if (answer.trim() !== "") {
      socket.emit("sendAnswerBuddies", roomCode, answer);
      onClick();
    }
  };

  useEffect(() => {}, [socket]);

  return (
    <>
      <h1 className="buddies__header">Answer</h1>
      <h2 className="buddies__question">
        {question.question}
        {question.question.charAt(question.question.length - 1) === "?" ? "" : "?"}
      </h2>
      <input
        className="buddies__input"
        placeholder="Your answer"
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button className="buddies__button" onClick={sendAnswer}>
        Answer
      </button>
    </>
  );
}
