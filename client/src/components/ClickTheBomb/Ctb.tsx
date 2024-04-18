import { useEffect, useState, useRef } from "react";
import "./style.scss";

import ClickSound from "../../assets/audio/click.mp3";
import { socket } from "../../socket";
import Explosion from "../Explosion";

import { User, Room } from "../../Types";
import { useAnimate, usePresence, motion } from "framer-motion";
import { C4 } from "./C4";

interface CtbProps {
  roomCode: string;
  users: User[];
  roomData: Room | null;
  onExit?: () => void;
}

export function Ctb({ roomCode, users, roomData, onExit }: CtbProps) {
  const [counter, setCounter] = useState<number>(0);
  const [yourTurn, setYourTurn] = useState<boolean>(false);
  const [turn, setTurn] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);
  const [yourClicks, setYourClicks] = useState<number>(0);
  const [isDead, setIsDead] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);

  // Enter and exit animations
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        animate(scope.current, { scale: [0, 1] }, { duration: 1, type: "spring" });
        animate(".ctb__c4", { scale: [0, 1] }, { duration: 1, type: "spring", delay: 0.2 });
        await animate(".ctb__buttonbox", { scale: [0, 1] }, { duration: 1, type: "spring", delay: 0.2 });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { opacity: [1, 0], y: [0, 300] }, { duration: 0.5, type: "spring" });
        safeToRemove();
        onExit && (await onExit());
      };
      exitAnimation();
    }
  }, [isPresence]);

  const onceDone = useRef<boolean>(false);

  const handleClickButton = () => {
    new Audio(ClickSound).play();
    setClicked(true);
    socket.emit("counterCtb", roomCode);
    setYourClicks((prevYourClicks) => prevYourClicks + 1);
  };

  const handleSkipButton = () => {
    new Audio(ClickSound).play();
    setClicked(false);
    setYourTurn(false);
    socket.emit("changeTurnCtb", roomCode);
    socket.emit("addClickForUser", roomCode, socket.id, yourClicks);
    setYourClicks(0);
  };

  useEffect(() => {
    const turnCtb = (data: { username: string; id: string }) => {
      setTurn(data.username);
      if (data.id == socket.id) {
        setYourTurn(true);
      }
    };

    const counterCtb = (data: number) => {
      setCounter(data);
    };

    const explosionCtb = (data: string) => {
      if (data == socket.id) {
        setIsDead(true);
      }
      setIsExploded(true);

      setTimeout(() => setIsExploded(false), 1250);
    };

    const endCtb = () => {
      setClicked(false);
      setYourTurn(false);
      setIsExploded(true);

      setTimeout(() => setIsExploded(false), 1250);
    };

    socket.on("receiveTurnCtb", turnCtb);

    socket.on("receiveCounterCtb", counterCtb);

    socket.on("receiveExplosionCtb", explosionCtb);

    socket.on("receiveEndCtb", endCtb);

    return () => {
      socket.off("receiveTurnCtb", turnCtb);
      socket.off("receiveCounterCtb", counterCtb);
      socket.off("receiveExplosionCtb", explosionCtb);
      socket.off("receiveEndCtb", endCtb);
    };
  }, [socket]);

  // make sure that the game starts only once by host
  useEffect(() => {
    if (onceDone.current) return;

    const host = users.find((user) => user.id === socket.id)?.is_host;

    if (host) {
      const usersLength = users.length;
      socket.emit("startGameCtb", { roomCode, usersLength });
    }

    onceDone.current = true;
  }, []);

  useEffect(() => {
    if (roomData?.in_game && turn === "") {
      socket.emit("getBombData", roomCode);
    }
  }, []);

  return (
    <div className="ctb" ref={scope}>
      <span className="ctb__gamename">Click The Bomb</span>
      <motion.span className="ctb__turn" initial={{ opacity: 50 }}>
        {turn}'s turn
      </motion.span>
      <motion.div className="ctb__c4" initial={{ scale: 0 }}>
        <C4 />
        <span className="ctb__c4__counter">{counter < 10 ? "0" + counter : counter}</span>
      </motion.div>
      {!isDead && (
        <motion.div className="ctb__buttonbox" initial={{ scale: 0 }}>
          <button className="ctb__button click" onClick={handleClickButton} disabled={!yourTurn}>
            Click
          </button>
          <button className="ctb__button skip" onClick={handleSkipButton} disabled={!clicked}>
            {">"}
          </button>
        </motion.div>
      )}
      {isDead && (
        <div>
          <span className="ctb__death">You died</span>
        </div>
      )}
      {isExploded && (
        <div className="ctb__explode">
          <Explosion />
        </div>
      )}
    </div>
  );
}
