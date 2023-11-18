import { useEffect, useState } from "react";
import "./style.scss";

interface StopwatchProps {
  timeLeft: number;
  maxTime: number;
}

function Stopwatch({ timeLeft, maxTime }: StopwatchProps) {
  const [strokeDashoffsetValue, setStrokeDashoffset] = useState<number>(0);
  useEffect(() => {
    const newStrokeDashoffset = 157 * ((maxTime - timeLeft) / maxTime);
    setStrokeDashoffset(newStrokeDashoffset);
  }, [timeLeft]);
  return (
    <div className="stopwatch">
      <svg
        width="16"
        height="11"
        viewBox="0 0 16 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stopwatch__button top"
      >
        <rect x="3.5" y="2" width="8" height="8" fill="#3C096C" />
        <rect x="0" width="15" height="6" fill="#5A189A" />
      </svg>

      <svg
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stopwatch__button left"
      >
        <rect
          x="3.07031"
          y="10.115"
          width="8.77193"
          height="8.77193"
          transform="rotate(-45 3.07031 10.115)"
          fill="#3C096C"
        />
        <rect
          y="10.1462"
          width="13.1579"
          height="6.57895"
          transform="rotate(-45 0 10.1462)"
          fill="#5A189A"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="70px"
        height="70px"
      >
        <circle
          cx="35px"
          cy="35px"
          r="25px"
          fill="none"
          strokeDasharray={157}
          strokeDashoffset={strokeDashoffsetValue}
          stroke="#9D4EDD"
          strokeWidth={8}
          strokeLinecap="square"
          className="stopwatch__circle"
        />
        <circle
          cx="35px"
          cy="35px"
          r="31px"
          strokeLinecap="round"
          fill="none"
          stroke="#3C096C"
          strokeWidth={"4px"}
        />
      </svg>
      <div className="stopwatch__middle">
        <span className="stopwatch__value">{timeLeft} s</span>
      </div>
    </div>
  );
}

export default Stopwatch;
