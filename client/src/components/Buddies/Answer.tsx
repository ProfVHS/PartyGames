import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { User } from "../../Types";
import { QuestionType } from "./Types";

import { motion } from "framer-motion";

interface AnswerProps {
  roomCode: string;
  users: User[];
  onClick: () => void;
  question: QuestionType;
}

export function Answer({ roomCode, users, onClick, question }: AnswerProps) {
  const [answer, setAnswer] = useState<string>("");

  const sendAnswer = () => {
    if(answer.trim() !== ""){
      socket.emit("sendAnswerBuddies", roomCode, answer);
      onClick();
    }
  };

  useEffect(() => {}, [socket]);

  return (
    <>
      {socket.id === question.author ? (
        <h3 className="buddies__waiting">Waiting for players to answer to your question</h3>
      ) : (
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
      )}
    </>
  );
}
