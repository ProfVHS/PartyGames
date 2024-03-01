import { Medal } from "../../components/Medal/Medal";
import "./style.scss";

export default function EndgamePage() {
  return (
    <div className="endgame">
      <div className="endgame__header">
        Rewards
        <div className="endgame__partygames">Party Games</div>
      </div>
      <div className="endgame__content">
        <Medal username="Ultra Mango Guy" points={150} award="ctbCLICK" />
        <Medal username="Ultra Mango Guy" points={150} award="firstDeath" />
        <Medal username="Ultra Mango Guy" points={150} award="mostLosedPoints" />
      </div>
    </div>
  );
}
