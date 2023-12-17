import { useEffect, useState, useRef } from "react";
import "../styles/Ctb.scss";

import c4 from "../assets/svgs/C4.svg";

import ClickSound from "../assets/audio/click.mp3";
import { socket } from "../socket";
import Explosion from "./Explosion";

import { User } from "../Types";
interface CtbProps {
  roomCode: string;
  users: User[];
}
export default function Ctb({ roomCode, users }: CtbProps) {
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
    socket.on("receiveTurnCtb", (data) => {
      setTurn(data.username);
      if (data.id == socket.id) {
        setYourTurn(true);
      } 
      console.log(data);
    });
    socket.on("receiveCounterCtb", (data) => {
      setCounter(data);
    });
    socket.on("receiveExplosionCtb", (data) => {
      console.log(data);
      if (data == socket.id) {
        setIsDead(true);
      }
      setIsExploded(true);

      setTimeout(() => setIsExploded(false), 1250);
    });
    socket.on("receiveEndCtb", () => {
      setClicked(false);
      setYourTurn(false);
      setIsExploded(true);

      setTimeout(() => setIsExploded(false), 1250);
    });
  }, [socket]);

  // make sure that the game starts only once by host
  useEffect(() => {
    if(onceDone.current) return;

    if(users.length > 0){
      if(users[0].id === socket.id){
        const usersLength = users.length;
        socket.emit("startGameCtb", { roomCode, usersLength } );
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
        <span className="ctb__c4__counter">
          {counter < 10 ? "0" + counter : counter}
        </span>
      </div>
      {!isDead && (
        <div className="ctb__buttonbox">
          <button
            className="ctb__button click"
            onClick={handleClickButton}
            disabled={!yourTurn}
          >
            Click
          </button>
          <button
            className="ctb__button skip"
            onClick={handleSkipButton}
            disabled={!clicked}
          >
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
