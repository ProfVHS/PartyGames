import React, { useEffect } from "react";

import "../styles/Leaderboard.scss";

interface LeaderboardProps {
  users: { username: string; score: number }[];
}
export default function Leaderboard({ users }: LeaderboardProps) {
  useEffect(() => {
    users.sort((a, b) => {
      const score1 = a.score; // ignore upper and lowercase
      const score2 = b.score; // ignore upper and lowercase
      if (score1 > score2) {
        return -1;
      }
      if (score1 < score2) {
        return 1;
      }
      return 0;
    });
  }, []);

  return (
    <div className="leaderboard">
      <span className="leaderboard__title">Leaderboard</span>
      {users.map((user, i) => {
        return <LeaderboardItem key={i} pos={i + 1} user={user} />;
      })}
    </div>
  );
}

interface LeaderboardItemProps {
  user: { username: string; score: number };
  pos: number;
}
function LeaderboardItem({ user, pos }: LeaderboardItemProps) {
  return (
    <div className="leaderboard__item">
      <span>
        {pos}. {user.username}
      </span>
      <span>{user.score}</span>
    </div>
  );
}
