import { User } from "../../Types";
import { socket } from "../../socket";
import { useState } from "react";

import { motion } from "framer-motion";

interface QuestionProps {
  roomCode: string;
  users: User[];
  onClick: () => void;
}

export function Question({ roomCode, users, onClick }: QuestionProps) {
  const [question, setQuestion] = useState<string>("");

  const sendQuestion = () => {
    socket.emit("sendQuestionBuddies", roomCode, question);
    onClick();
  };

  return (
    <>
      <motion.h1 className="buddies__header" initial={{ opacity: 0, scale: 0 }}>
        Question
      </motion.h1>
      <motion.input
        className="buddies__input"
        placeholder="Make a question"
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        initial={{ opacity: 0, scale: 0 }}
      />
      <motion.button className="buddies__button" onClick={sendQuestion} initial={{ opacity: 0, scale: 0 }}>
        Ask
      </motion.button>
    </>
  );
}
