import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect, useState } from "react";
import { Podium } from "../../components/Podium";
import { User } from "../../Types";

const exampleUsers: User[] = [
  { id: "0", username: "Ultra Mango Guy", score: 150, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "1", username: "Ultra Mango Guy", score: 300, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "2", username: "Ultra Mango Guy", score: 75, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "3", username: "Ultra Mango Guy", score: 2, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "4", username: "Ultra Mango Guy", score: 400, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "5", username: "Ultra Mango Guy", score: 250, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "6", username: "Ultra Mango Guy", score: 100, alive: true, id_room: "0", id_selected: 0, position: 1 },
  { id: "7", username: "Ultra Mango Guy", score: 65, alive: true, id_room: "0", id_selected: 0, position: 1 },
];

export default function EndgamePage() {
  const [showMedals, setShowMedals] = useState<boolean>(true);
  const [showPodium, setShowPodium] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>(exampleUsers);

  useEffect(() => {
    const newUsers = users.sort((a, b) => b.score - a.score);
    setUsers(newUsers);

    setTimeout(() => {
      setShowMedals(false);
      setTimeout(() => {
        setShowPodium(true);
      }, 2000);
    }, 5000);
  }, []);

  console.log(users);

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
              {users.slice(0, 3).map((user, index) => (
                <Podium position={index + 1} score={user.score} username={user.username} key={index} />
              ))}
            </div>
            <div className="endgame__podium__lower">
              {users.slice(3, 8).map((user, index) => (
                <Podium position={index + 4} score={user.score} username={user.username} key={index} />
              ))}
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
