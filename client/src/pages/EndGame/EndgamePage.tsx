import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect, useState } from "react";

export default function EndgamePage() {
  const [showMedals, setShowMedals] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setShowMedals(false);
    }, 5000);
  }, []);

  return (
    <div className="endgame">
      <div className="endgame__header">
        Rewards
        <div className="endgame__partygames">Party Games</div>
      </div>
      <div className="endgame__content">
        <AnimatePresence>
          {showMedals ? <Medal id={0} username="Ultra Mango Guy" points={150} award="ctbCLICK" /> : null}
        </AnimatePresence>
        <AnimatePresence>
          {showMedals ? <Medal id={1} username="Ultra Mango Guy" points={150} award="firstDeath" /> : null}
        </AnimatePresence>
        <AnimatePresence>
          {showMedals ? <Medal id={2} username="Ultra Mango Guy" points={150} award="mostLosedPoints" /> : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
