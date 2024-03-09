import { useEffect, useRef, useState } from "react";
import "./style.scss";
import { useAnimate, usePresence } from "framer-motion";
import { on } from "events";

interface LeaderboardProps {
  oldUsers: { username: string; score: number }[];
  newUsers: { username: string; score: number }[];
  onExit: () => void;
}
export default function Leaderboard({ oldUsers, newUsers, onExit }: LeaderboardProps) {
  // sort users by score
  const sortedOldUsers = oldUsers.sort((a, b) => b.score - a.score);
  const sortedNewUsers = newUsers.sort((a, b) => b.score - a.score);

  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(scope.current, { opacity: [0, 1], x: [400, 0] }, { duration: 1, type: "spring" });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { opacity: [1, 0], x: [0, -400] }, { duration: 1, type: "spring" });
        safeToRemove();
        onExit();
      };
      exitAnimation();
    }
  }, [isPresence]);

  return (
    <div className="leaderboard" ref={scope}>
      <span className="leaderboard__title">Leaderboard</span>
      <div className="leaderboard__grid">
        {sortedOldUsers.map((user, i) => {
          return <LeaderboardItem key={i} pos={i + 1} firstSideUser={user} secondSideUser={sortedNewUsers[i]} />;
        })}
      </div>
    </div>
  );
}

interface LeaderboardItemProps {
  firstSideUser: { username: string; score: number };
  secondSideUser: { username: string; score: number };
  pos: number;
}
function LeaderboardItem({ firstSideUser, secondSideUser, pos }: LeaderboardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFlipping(true);
    }, 300 * pos);
    setTimeout(() => {
      setIsFlipped(true);
      setFlipping(false);
    }, 300 * pos + 300);
  }, []);

  return (
    <div className={`leaderboard__item ${flipping ? "flipped" : ""}`}>
      {!isFlipped && <LeaderboardItemSide user={firstSideUser} pos={pos} />}
      {isFlipped && <LeaderboardItemSide user={secondSideUser} pos={pos} />}
    </div>
  );
}

interface LeaderboardItemSideProps {
  user: { username: string; score: number };
  pos: number;
}
const LeaderboardItemSide = ({ user, pos }: LeaderboardItemSideProps) => {
  return (
    <>
      <span>
        {pos}. {user.username}
      </span>
      <span>{user.score}</span>
    </>
  );
};
