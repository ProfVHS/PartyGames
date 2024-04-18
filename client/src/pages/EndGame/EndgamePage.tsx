import { AnimatePresence } from "framer-motion";
import { Medal } from "../../components/Medal/Medal";
import "./style.scss";
import { useEffect, useRef, useState } from "react";
import { Podium } from "../../components/Podium";
import { MedalProps, User } from "../../Types";
import { socket } from "../../socket";
import { useLocation } from "react-router-dom";
import { ProgressBar } from "../../components/ProgressBar";

const waitTimeMs = 10000;

export default function EndgamePage() {
  const [showMedals, setShowMedals] = useState<boolean>(true);
  const [showPodium, setShowPodium] = useState<boolean>(false);
  const [podium, setPodium] = useState<User[]>([]);
  const [medals, setMedals] = useState<MedalProps[]>([]);

  const [time, setTime] = useState<number>(0);
  let timeInterval: NodeJS.Timeout;

  const onceDone = useRef<boolean>(false);
  const location = useLocation();

  const roomCode: string = location.state?.roomCode;
  const users: User[] = location.state?.users;

  useEffect(() => {
    if (onceDone.current) return;
    const host = users.find((user) => user.id == socket.id)?.is_host;
    if (!host) return;
    console.log("getMedals");
    socket.emit("getMedals", roomCode);
    onceDone.current = true;
  }, []);

  useEffect(() => {
    timeInterval = setInterval(async () => {
      if (time < waitTimeMs) {
        const newTime = time + 10;
        setTime(newTime);
      } else {
        console.log("time is up");
        setShowMedals(false);
        socket.emit("getPodium", roomCode);
        clearInterval(timeInterval);
      }
    }, 10);
    return () => clearInterval(timeInterval);
  }, [time]);

  useEffect(() => {
    socket.on("receiveMedals", (medals) => {
      setMedals(medals);
    });

    socket.on("receivePodium", (users) => {
      console.log(users);
      setPodium(users);
      setTimeout(() => {
        setShowPodium(true);
      }, 2000);
    });

    socket.on("receiveUserIsInRoom", (data) => {
      if (!data) {
        window.location.href = "/";
      }
    });
  }, [socket]);

  useEffect(() => {
    socket.emit("checkIfUserIsInRoom", roomCode);
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", () => {
      window.location.href = "/";
    });
  });

  return (
    <div className="endgame">
      <div className="endgame__header">
        {!showPodium ? "Rewards" : "Podium"}
        <div className="endgame__partygames">Party Games</div>
      </div>
      {showMedals && <ProgressBar width="600px" max={waitTimeMs} progress={time} />}
      <div className="endgame__content" style={!showPodium ? { flexDirection: "row" } : { flexDirection: "column" }}>
        {showPodium && (
          <>
            <div className="endgame__podium__top3">
              {podium.slice(0, 3).map((user, index) => (
                <Podium position={index + 1} score={user.score} username={user.username} key={index} usersLength={podium.length} />
              ))}
            </div>
            <div className="endgame__podium__lower">
              {podium.slice(3, 8).map((user, index) => (
                <Podium position={index + 4} score={user.score} username={user.username} key={index} usersLength={podium.length} />
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
