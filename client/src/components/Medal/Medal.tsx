import React, { useEffect } from "react";

import "./style.scss";
import { MedalSvg } from "./MedalSvg";
import { LoseLineSvg, SkullSvg, TouchSvg } from "./Icons";
import { useAnimate, usePresence } from "framer-motion";
import { awardType } from "../../Types";

interface MedalProps {
  id: number;
  username: string;
  points: number;
  award: awardType;
}

export const Medal = ({ id, username, points, award }: MedalProps) => {
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (!isPresence) {
      const exitAnimation = async () => {
        await animate(
          scope.current,
          { opacity: [1, 0.8, 0], x: 1000 },
          { duration: 1, type: "spring", delay: id * 0.25 }
        );
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresence]);

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