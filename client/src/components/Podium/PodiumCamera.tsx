import { motion, useAnimate, usePresence } from "framer-motion";
import { useEffect } from "react";

export const PodiumCamera = () => {
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
    <motion.div className="podium__camera" ref={scope} initial={{ x: "-50%" }}>
      <video className="podium__camera__video" autoPlay={true} />
    </motion.div>
  );
};
