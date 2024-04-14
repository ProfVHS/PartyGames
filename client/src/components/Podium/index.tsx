import { AnimatePresence, useAnimate, usePresence } from "framer-motion";
import { PodiumCamera } from "./PodiumCamera";
import "./style.scss";
import { useEffect, useState } from "react";

interface PodiumProps {
  position: number;
  username: string;
  score: number;
  usersLength: number;
}

const podiumHeights = [215, 150, 150, 205, 170, 170, 155, 155];
const podiumOrders = [2, 1, 3, 3, 2, 4, 1, 5];
const podiumDelays = [10, 7, 4, 1, 1, 1, 1, 1];
const podiumDelaysFor3orLess = [3, 2, 1];

export const Podium = ({ position, username, score, usersLength }: PodiumProps) => {
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();
  const [showCamera, setShowCamera] = useState<boolean>(false);

  const showUpAnimation = () => {
    const delay = usersLength <= 3 ? podiumDelaysFor3orLess[position - 1] : podiumDelays[position - 1];
    animate(".podium__content", { height: [0, podiumHeights[position - 1]], y: [0] }, { duration: 2, type: "spring", delay: delay }).then(() => {
      setShowCamera(true);
    });

    animate(".podium__username", { scale: [0, 1] }, { duration: 1, type: "spring", delay: delay + 0.5 });
    animate(".podium__score", { scale: [0, 1] }, { duration: 1, type: "spring", delay: delay + 0.5 });
    animate(".podium__position", { scale: [0, 1] }, { duration: 0.5, type: "spring", delay: delay + 0.5 });
  };

  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(scope.current, { opacity: [0, 1], y: [300, 0] }, { duration: 0.5, type: "spring", delay: 0.05 * position });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { opacity: [1, 0], y: [0, 300] }, { duration: 0.5, type: "spring" });
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresence]);

  useEffect(() => {
    showUpAnimation();
  }, []);
  return (
    <div className="podium" ref={scope} style={{ order: podiumOrders[position - 1] }}>
      {showCamera && (
        <AnimatePresence>
          <PodiumCamera position={position} />
        </AnimatePresence>
      )}
      <div className="podium__content">
        <div className="podium__top"></div>
        <span className="podium__position">#{position}</span>
        <span className="podium__username">{username}</span>
        <span className="podium__score">
          <span className="podium__score__number">{score}</span> Score
        </span>
      </div>
    </div>
  );
};
