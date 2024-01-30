import { useEffect, useState } from "react";
import { socket } from "../../socket"
import { User } from "../../Types";

interface AnswerProps {
  roomCode: string;
  users: User[];
  onClick: () => void;
  question: string;
}

export function Answer({roomCode, users, onClick, question}: AnswerProps) {
  const [answer, setAnswer] = useState<string>("");
  
  const sendAnswer = () => {
    onClick();

    socket.emit("sendAnswerBuddies", roomCode, answer);
  };

  useEffect(() => {
    
  }, [socket]);

  return (
    <>
        <h1>Answer</h1>
        <h2>{question}?</h2>
        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}/>
        <button onClick={sendAnswer}>Answer</button>
    </>
  )
}
