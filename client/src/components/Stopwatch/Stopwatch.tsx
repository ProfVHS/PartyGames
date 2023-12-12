import { useEffect, useState } from "react";
import { StopwatchSvg } from "./SvgStopwatch";

import "./style.scss";

interface StopwatchProps {
  size: number;
  maxTime: number;
  timeLeft: number;
}
export const Stopwatch = ({ size, maxTime, timeLeft }: StopwatchProps) => {
  const [strokeDashoffsetValue, setStrokeDashoffset] = useState<number>(0);
  useEffect(() => {
    const newStrokeDashoffset = 157 * ((maxTime - timeLeft) / maxTime);
    setStrokeDashoffset(newStrokeDashoffset);
  }, [timeLeft]);
  return (
    <div className="stopwatch">
      <span
        className="stopwatch__middle stopwatch__value"
        style={{ fontSize: size / 3 }}
      >
        {timeLeft}
      </span>
      <StopwatchSvg
        strokeOffset={strokeDashoffsetValue}
        props={{ width: size, height: size }}
      />
    </div>
  );
};
