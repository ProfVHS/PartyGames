import { motion, useAnimate, usePresence } from "framer-motion";
import { useEffect } from "react";
import { FirstPlaceCrown, SecondPlaceCrown, ThirdPlaceCrown } from "./Crowns";

interface CameraProps {
  position: number;
}

export const PodiumCamera = ({ position }: CameraProps) => {
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(scope.current, { scaleY: [0, 1] }, { duration: 0.5, type: "spring" });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { scaleY: [1, 0] }, { duration: 0.5, type: "spring" });
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresence]);
  return (
    <>
      <motion.div className="podium__camera" ref={scope} initial={{ x: "-50%" }}>
        {position === 1 && <FirstPlaceCrown className="podium__crown" />}
        {position === 2 && <SecondPlaceCrown className="podium__crown" />}
        {position === 3 && <ThirdPlaceCrown className="podium__crown" />}
        <video className="podium__camera__video" autoPlay={true} />
      </motion.div>
    </>
  );
};
