import { useEffect, useRef, useState } from "react";
import "./style.scss";
import { motion } from "framer-motion";
import { NoSignalIcon } from "./IconsForCamera";

interface CameraProps {
  username: string;
  score: number;
  isDisconnected: boolean;
}

const scoreAnimationDuration = 0.5;

function Camera({ username, score, isDisconnected }: CameraProps) {
  const [userScore, setUserScore] = useState<number>(0);

  const interval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (score > userScore) {
      interval.current = setInterval(() => {
        setUserScore((prevScore) => prevScore + 1);
      }, scoreAnimationDuration / score);
    } else {
      interval.current = setInterval(() => {
        setUserScore((prevScore) => prevScore - 1);
      }, scoreAnimationDuration / score);
    }
  }, [score]);

  useEffect(() => {
    if (userScore === score) clearInterval(interval.current);
  }, [userScore]);

  return (
    <motion.div className={`camera ${isDisconnected ? "disconnected" : ""}`} initial={{ scale: 0.0 }} animate={{ scale: [0.0, 1.0] }} transition={{ duration: 1, type: "spring" }}>
      <span className="camera__username">{username}</span>
      <video className="camera__video" autoPlay={true} />
      {isDisconnected ? <NoSignalIcon className="camera__icon" /> : null}
      <span className="camera__score">Score: {userScore}</span>
    </motion.div>
  );
}

export default Camera;
