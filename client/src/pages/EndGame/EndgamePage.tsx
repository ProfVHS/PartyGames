import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect, useState } from "react";
import { Podium } from "../../components/Podium";

export default function EndgamePage() {
  const [showMedals, setShowMedals] = useState<boolean>(true);
  const [showPodium, setShowPodium] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setShowMedals(false);
      setTimeout(() => {
        setShowPodium(true);
      }, 2000);
    }, 5000);
  }, []);

  return (
    <div className="endgame">
      <div className="endgame__header">
        Rewards
        <div className="endgame__partygames">Party Games</div>
      </div>
      <div className="endgame__content" style={!showPodium ? { flexDirection: "row" } : { flexDirection: "column" }}>
        {showPodium && (
          <>
            <div className="endgame__podium__top3">
              <Podium position={1} />
              <Podium position={2} />
              <Podium position={3} />
            </div>
            <div className="endgame__podium__lower">
              <Podium position={4} />
              <Podium position={5} />
              <Podium position={6} />
              <Podium position={7} />
              <Podium position={8} />
            </div>
          </>
        )}
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
