import React, { useEffect, useState } from "react";
import "../styles/Ctb.scss";

import c4 from "../assets/svgs/C4.svg";

import ClickSound from "../assets/audio/click.mp3";
import { Socket } from "socket.io-client";

interface CtbProps {
  socket: Socket;
  roomCode: string;
}
export default function Ctb({ socket, roomCode }: CtbProps) {
  const [counter, setCounter] = useState<number>(0);
  const [yourTurn, setYourTurn] = useState<boolean>(true);
  const [turn, setTurn] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);

  const handleClickButton = () => {
    new Audio(ClickSound).play();
    setClicked(true);
    socket.emit("send_ctb_counter", roomCode);
  };

  const handleSkipButton = () => {
    new Audio(ClickSound).play();
    setClicked(false);
    setYourTurn(false);
    socket.emit("send_ctb_turn", roomCode);
  };

  useEffect(() => {
    socket.on("receive_ctb_counter", (data) => {
      setCounter(data);
    });
    socket.on("receive_ctb_turn", (data) => {
      setTurn(data);
    });
    socket.on("receive_ctb_end", (data) => {
      setClicked(false);
      setYourTurn(false);
      alert("Wybuchł gracz " + data + "!");
    });
  }, []);

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
    </div>
  );
}
