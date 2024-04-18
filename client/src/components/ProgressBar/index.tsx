import { useEffect, useState } from "react";
import "./style.scss";

interface ProgressBarProps {
  max: number;
  progress: number;
  width: string;
}

export function ProgressBar({ max, progress, width }: ProgressBarProps) {
  const [progressPercent, setProgressPercent] = useState(0);
  useEffect(() => {
    const barWidth = (progress / max) * 100;
    setProgressPercent(barWidth);
  }, [progress]);
  return (
    <div className="progressbar" style={{ width: width }}>
      <div className="progressbar__bar" style={{ width: `${progressPercent}%` }}></div>
    </div>
  );
}
