import { useState } from "react";
import Leaderboard from "../components/Leaderboard";

const oldUsersLeaderBoard: { username: string; score: number }[] = [
  { username: "user1", score: 100 },
  { username: "user2", score: 200 },
  { username: "user3", score: 300 },
  { username: "user4", score: 400 },
  { username: "user5", score: 500 },
  { username: "user6", score: 600 },
  { username: "user7", score: 700 },
  { username: "user8", score: 800 },
];

const newUsersLeaderBoard: { username: string; score: number }[] = [
  { username: "user1", score: 1000 },
  { username: "user2", score: 200 },
  { username: "user3", score: 300 },
  { username: "user4", score: 400 },
  { username: "user5", score: 500 },
  { username: "user6", score: 600 },
  { username: "user7", score: 700 },
  { username: "user8", score: 800 },
];

export default function TestPage() {
  const [test, setTest] = useState(true);
  return (
    <>
      {test && <Leaderboard oldUsers={oldUsersLeaderBoard} newUsers={newUsersLeaderBoard} />}
      <button onClick={() => setTest(!test)}>Test</button>
    </>
  );
}
