import { useEffect, useRef, useState } from "react";
import "./style.scss";

import { animate, AnimatePresence, motion, useAnimate, usePresence } from "framer-motion";
import { NoSignalIcon, SkullIcon } from "./IconsForCamera";
import { useCountUp } from "react-countup";
import { FirstPlaceCrown, SecondPlaceCrown, ThirdPlaceCrown } from "../../Crowns";
import { socket } from "../../socket";

interface CameraProps {
  userId: string;
  username: string;
  score: number;
  isDisconnected: boolean;
  isAlive: boolean;
  isTop3: number;
}

export default function Camera({ username, score, isDisconnected, isAlive, userId, isTop3 }: CameraProps) {
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
      <AnimatePresence>{isTop3 !== -1 ? <CrownCamera position={isTop3} /> : null}</AnimatePresence>
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

const CrownCamera = ({ position }: { position: number }) => {
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();
  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(scope.current, { scale: [0, 1] }, { duration: 0.5, type: "spring" });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { scale: [1, 0] }, { duration: 0.5, type: "spring" });
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresence]);
  return (
    <motion.div ref={scope} initial={{ scale: 0, x: "25%", y: "-75%" }} className="camera__crown">
      {position === 0 && <FirstPlaceCrown />}
      {position === 1 && <SecondPlaceCrown />}
      {position === 2 && <ThirdPlaceCrown />}
    </motion.div>
  );
};
