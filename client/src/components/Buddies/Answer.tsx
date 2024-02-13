import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { User } from "../../Types";

interface AnswerProps {
  roomCode: string;
  users: User[];
  onClick: () => void;
  question: string;
  user: string;
}

export function Answer({ roomCode, users, onClick, question, user }: AnswerProps) {
  const [answer, setAnswer] = useState<string>("");

  const sendAnswer = () => {
    onClick();

    socket.emit("sendAnswerBuddies", roomCode, answer);
  };

  useEffect(() => {}, [socket]);

  return (
    <>
      {socket.id === user ? (
        <h3 className="buddies__waiting">Waiting for players to answer to your question</h3>
      ) : (
        <>
          <h1 className="buddies__header">Answer</h1>
          <h2 className="buddies__question">
            {question}
            {question.charAt(question.length - 1) === "?" ? "" : "?"}
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
