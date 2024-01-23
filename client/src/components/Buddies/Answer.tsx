import { useEffect, useState } from "react";
import { socket } from "../../socket"
import { User } from "../../Types";

interface AnswerProps {
  roomCode: string;
  users: User[];
}

export function Answer({roomCode, users}: AnswerProps) {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  
  const sendAnswer = () => {
    socket.emit("sendAnswerBuddies", roomCode, answer);
  };

  useEffect(() => {
    const updateQuestion = (data: string) => {
      setQuestion(data);
    };

    socket.on("receiveQuestionBuddies", (data) => {
      console.log(data);
      setQuestion(data);
    });

  }, [socket]);

  return (
    <>
        <h1>Answer</h1>
        <h2>{question}</h2>
        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}/>
        <button onClick={sendAnswer}>Answer</button>
    </>
  )
}
