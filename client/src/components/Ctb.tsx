import React, { useState } from "react";
import "../styles/Ctb.scss";

import c4 from "../assets/svgs/C4.svg";

import ClickSound from "../assets/audio/click.mp3";

interface CtbProps {
  turn: string;
}
export default function Ctb({ turn }: CtbProps) {
  const [counter, setCounter] = useState<number>(0);
  const [yourTurn, setYourTurn] = useState<boolean>(true);
  const [clicked, setClicked] = useState<boolean>(false);

  const addCounter = () => {
    const newCounter = counter + 1;
    setCounter(newCounter);
  };

  const handleClickButton = () => {
    new Audio(ClickSound).play();
    setClicked(true);
    addCounter();
  };

  const handleSkipButton = () => {
    new Audio(ClickSound).play();
    setClicked(false);
    setYourTurn(false);
  };

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
