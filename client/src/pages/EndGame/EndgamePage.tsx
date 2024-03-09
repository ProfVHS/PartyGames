import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect, useState } from "react";
import { Podium } from "../../components/Podium";
import { MedalProps, User } from "../../Types";

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

const exampleMedals: MedalProps[] = [
  { userID: "0", username: "Ultra Mango Guy", points: 150, award: "ctbCLICK" },
  { userID: "4", username: "Ultra Mango Guy", points: 150, award: "firstDeath" },
  { userID: "3", username: "Ultra Mango Guy", points: 150, award: "mostLosedPoints" },
];

export default function EndgamePage() {
  const [showMedals, setShowMedals] = useState<boolean>(true);
  const [showPodium, setShowPodium] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>(exampleUsers);
  const [medals, setMedals] = useState<MedalProps[]>(exampleMedals);

  const handleMedals = () => {
    const newUsers = users.map((user) => {
      if (user.id.valueOf() === medals[0].userID.valueOf()) {
        return { ...user, score: user.score + medals[0].points };
      }
      if (user.id.valueOf() === medals[1].userID.valueOf()) {
        return { ...user, score: user.score + medals[1].points };
      }
      if (user.id.valueOf() === medals[2].userID.valueOf()) {
        return { ...user, score: user.score + medals[2].points };
      }
      return user;
    });

    const sortedUsers = newUsers.sort((a, b) => b.score - a.score);

    setUsers(sortedUsers);
  };

  useEffect(() => {
    handleMedals();

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
        {!showPodium ? "Rewards" : "Podium"}
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
          {showMedals ? (
            <Medal id={0} username={medals[0].username} points={medals[0].points} award={medals[0].award} />
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showMedals ? (
            <Medal id={1} username={medals[1].username} points={medals[1].points} award={medals[1].award} />
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showMedals ? (
            <Medal id={2} username={medals[2].username} points={medals[2].points} award={medals[2].award} />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
