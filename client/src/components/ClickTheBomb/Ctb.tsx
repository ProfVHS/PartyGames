import { useEffect, useState, useRef } from "react";
import "./style.scss";

import c4 from "../../assets/svgs/C4.svg";

import ClickSound from "../../assets/audio/click.mp3";
import { socket } from "../../socket";
import Explosion from "../Explosion";

import { CtbProps } from "../../Types";

export function Ctb({ roomCode, users }: CtbProps) {
  const [counter, setCounter] = useState<number>(0);
  const [yourTurn, setYourTurn] = useState<boolean>(false);
  const [turn, setTurn] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);
  const [isDead, setIsDead] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);

  const onceDone = useRef<boolean>(false);

  const handleClickButton = () => {
    new Audio(ClickSound).play();
    setClicked(true);
    socket.emit("counterCtb", roomCode);
  };

  const handleSkipButton = () => {
    new Audio(ClickSound).play();
    setClicked(false);
    setYourTurn(false);
    socket.emit("changeTurnCtb", roomCode);
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

    if (users.length > 0) {
      if (users[0].id === socket.id) {
        const usersLength = users.length;
        socket.emit("startGameCtb", { roomCode, usersLength });
      }
    }

    onceDone.current = true;
  }, []);

  setTimeout(() => {}, 2000);

  return (
    <div className="ctb">
      <span className="ctb__gamename">Click The Bomb</span>
      <span className="ctb__turn">{turn}'s turn</span>
      <div className="ctb__c4">
        <img src={c4} />
        <span className="ctb__c4__counter">{counter < 10 ? "0" + counter : counter}</span>
      </div>
      {!isDead && (
        <div className="ctb__buttonbox">
          <button className="ctb__button click" onClick={handleClickButton} disabled={!yourTurn}>
            Click
          </button>
          <button className="ctb__button skip" onClick={handleSkipButton} disabled={!clicked}>
            {">"}
          </button>
        </div>
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
