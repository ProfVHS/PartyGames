import { useEffect, useState } from "react";
import "./style.scss";
import { AnimatePresence, useAnimate, usePresence, motion } from "framer-motion";

interface LeaderboardGameProps {
  users?: { username: string; scoreToAdd: number | null; record: number }[];
  onExit?: () => void;
}

export default function LeaderboardGame({ users, onExit }: LeaderboardGameProps) {
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
        onExit && onExit();
      };
      exitAnimation();
    }
  }, [isPresence]);

  useEffect(() => {
    users?.sort((a, b) => {
      return b.record - a.record;
    });
  }, [users]);

  return (
    <>
      <div className="leaderboardGame" ref={scope}>
        <div className="leaderboardGame__title">Leaderboard</div>
        <div className="leaderboard__grid">
          {users?.map((user, index) => (
            <AnimatePresence key={index}>
              <LeaderboardItem pos={index} username={user.username} scoreToAdd={user.scoreToAdd} record={user.record} />
            </AnimatePresence>
          ))}
        </div>
      </div>
    </>
  );
}

interface LeaderboardItemProps {
  username: string;
  scoreToAdd: number | null;
  record: number;
  pos: number;
}

function LeaderboardItem({ username, scoreToAdd, record, pos }: LeaderboardItemProps) {
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();
  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(scope.current, { opacity: [0, 1], y: [100, 0] }, { duration: 0.6, type: "spring", delay: 0.4 + 0.1 * pos });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { opacity: [1, 0], y: [0, 100] }, { duration: 0.6, type: "spring", delay: 0.4 + 0.1 * pos });
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresence]);
  return (
    <motion.div initial={{ opacity: 0 }} className={`leaderboard__item`} ref={scope}>
      <span>{username}</span>
      <span>{scoreToAdd ? `+${scoreToAdd}` : ""}</span>
      <span>{record}</span>
    </motion.div>
  );
}
