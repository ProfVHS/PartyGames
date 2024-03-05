import { motion, useAnimate } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect } from "react";

export default function EndgamePage() {
  return (
    <div className="endgame">
      <div className="endgame__header">
        Rewards
        <div className="endgame__partygames">Party Games</div>
      </div>
      <div className="endgame__content">
        <Medal id={0} username="Ultra Mango Guy" points={150} award="ctbCLICK" />
        <Medal id={1} username="Ultra Mango Guy" points={150} award="firstDeath" />
        <Medal id={2} username="Ultra Mango Guy" points={150} award="mostLosedPoints" />
      </div>
    </div>
  );
}
