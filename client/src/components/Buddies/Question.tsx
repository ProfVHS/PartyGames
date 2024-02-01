import { User } from "../../Types";
import { socket } from "../../socket"
import { useState } from "react";

interface QuestionProps {
  roomCode: string;
  users: User[];
  onClick: () => void;
}

export function Question({roomCode, users, onClick}: QuestionProps) {
    const [question, setQuestion] = useState<string>("");

    const sendQuestion = () => {
        socket.emit("sendQuestionBuddies", roomCode, question);
        onClick();
    }

    return (
      <>
          <h1>Question</h1>
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}/>
          <button onClick={sendQuestion}>Ask</button>
      </>
    )
  }
  