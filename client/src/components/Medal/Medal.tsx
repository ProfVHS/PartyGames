import React from "react";

import "./style.scss";
import { MedalSvg } from "./MedalSvg";
import { LoseLineSvg, SkullSvg, TouchSvg } from "./Icons";

interface MedalProps {
  username: string;
  points: number;
  award: "ctbCLICK" | "firstDeath" | "mostLosedPoints";
}

export const Medal = ({ username, points, award }: MedalProps) => {
  return (
    <div className="medal">
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
