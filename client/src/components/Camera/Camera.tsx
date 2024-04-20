import { useEffect, useRef } from "react";
import "./style.scss";

import { AnimatePresence, motion, useAnimate, usePresence } from "framer-motion";
import { NoSignalIcon, SkullIcon } from "./IconsForCamera";
import { useCountUp } from "react-countup";

interface CameraProps {
  username: string;
  score: number;
  isDisconnected: boolean;
  isAlive: boolean;
}

export default function Camera({ username, score, isDisconnected, isAlive }: CameraProps) {
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
      <CameraIcon isDisconnected={isDisconnected} isAlive={isAlive} />
      <span className="camera__score">
        Score: <span ref={countUpRef} />
      </span>
    </motion.div>
  );
}

interface CameraIconProps {
  isDisconnected: boolean;
  isAlive: boolean;
}
const CameraIcon = ({ isDisconnected, isAlive }: CameraIconProps) => {
  return (
    <AnimatePresence>
      {isDisconnected ? <NoSignalIcon className="camera__icon" /> : null}
      {!isAlive && !isDisconnected ? <SkullIcon className="camera__icon" /> : null}
    </AnimatePresence>
  );
};
