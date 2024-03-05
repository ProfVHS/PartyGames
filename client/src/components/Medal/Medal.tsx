import React, { useEffect } from "react";

import "./style.scss";
import { MedalSvg } from "./MedalSvg";
import { LoseLineSvg, SkullSvg, TouchSvg } from "./Icons";
import { useAnimate } from "framer-motion";

interface MedalProps {
  id: number;
  username: string;
  points: number;
  award: "ctbCLICK" | "firstDeath" | "mostLosedPoints";
}

export const Medal = ({ id, username, points, award }: MedalProps) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(".medal__user", { opacity: [0, 1], y: [300, 0] }, { duration: 1, type: "spring" });
    animate(".medal__svg", { opacity: [0, 1], y: [300, 0] }, { duration: 1, type: "spring", delay: id + 1 });
    animate(".medal__info", { opacity: [0, 1], y: [300, 0] }, { duration: 1, type: "spring", delay: id + 1 });
  }, []);
  return (
    <div className="medal" ref={scope}>
      <div className="medal__user">{username}</div>
      <div className="medal__svg">
        <MedalSvg />
        {award === "ctbCLICK" && <TouchSvg className="medal__svg__icon" />}
        {award === "firstDeath" && <SkullSvg className="medal__svg__icon" />}
        {award === "mostLosedPoints" && <LoseLineSvg className="medal__svg__icon" />}
      </div>
      <div className="medal__info">
        <span>
          {award === "ctbCLICK" && "Most Bomb Clicks"}
          {award === "firstDeath" && "Most First Deaths"}
          {award === "mostLosedPoints" && "Most Lost Points"}
        </span>
        <span>{points} points</span>
      </div>
    </div>
  );
};
