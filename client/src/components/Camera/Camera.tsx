import { useEffect, useRef } from "react";
import "./style.scss";

import { motion } from "framer-motion";
import { NoSignalIcon } from "./IconsForCamera";
import { useCountUp } from "react-countup";

interface CameraProps {
  username: string;
  score: number;
  isDisconnected: boolean;
}

function Camera({ username, score, isDisconnected }: CameraProps) {
  const countUpRef = useRef(null);

  const { update } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: score,
    duration: 1,
  });

  useEffect(() => {
    update(score);
  }, [score]);

  return (
    <motion.div className={`camera ${isDisconnected ? "disconnected" : ""}`} initial={{ scale: 0.0 }} animate={{ scale: [0.0, 1.0] }} transition={{ duration: 1, type: "spring" }}>
      <span className="camera__username">{username}</span>
      <video className="camera__video" autoPlay={true} />
      {isDisconnected ? <NoSignalIcon className="camera__icon" /> : null}
      <span className="camera__score">
        Score: <span ref={countUpRef} />
      </span>
    </motion.div>
  );
}

export default Camera;
