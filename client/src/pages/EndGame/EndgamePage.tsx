import { AnimatePresence } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect, useRef, useState } from "react";
import { Podium } from "../../components/Podium";
import { MedalProps, User } from "../../Types";
import { socket } from "../../socket";
import { useLocation } from "react-router-dom";

export default function EndgamePage() {
  const [showMedals, setShowMedals] = useState<boolean>(true);
  const [showPodium, setShowPodium] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);
  const [medals, setMedals] = useState<MedalProps[]>([]);

  const onceDone = useRef<boolean>(false);
  const location = useLocation();

  const roomCode: string = location.state?.code;

  useEffect(() => {
    if (onceDone.current) return;
    socket.emit("getMedals", roomCode);
    onceDone.current = true;
  }, []);

  useEffect(() => {
    socket.on("receiveMedals", (medals) => {
      console.log(medals);
      setMedals(medals);
      setTimeout(() => {
        setShowMedals(false);
        socket.emit("getPodium", roomCode);
      }, 5000);
    });

    socket.on("receivePodium", (users) => {
      setUsers(users);
      setTimeout(() => {
        setShowPodium(true);
      }, 2000);
    });
  }, [socket]);

  console.log(users);
  console.log(medals);

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
                <Podium position={index + 1} score={user.score} username={user.username} key={index} usersLength={users.length} />
              ))}
            </div>
            <div className="endgame__podium__lower">
              {users.slice(3, 8).map((user, index) => (
                <Podium position={index + 4} score={user.score} username={user.username} key={index} usersLength={users.length} />
              ))}
            </div>
          </>
        )}
        <AnimatePresence>
          {medals.length > 0 && showMedals
            ? medals.map((medal, i) => {
                return <Medal id={i} key={i} username={medal.username} points={medal.points} award={medal.award} />;
              })
            : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
