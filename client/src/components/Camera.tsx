import { LegacyRef } from "react";
import "../styles/Camera.scss";

interface CameraProps {
  username: string;
  score: number;
  stream?: LegacyRef<HTMLVideoElement> | undefined;
}

function Camera({ username, score, stream}: CameraProps) {
  
  
  return (
    <div className="camera">
      <span className="camera__username">{username}</span>
      <video className="camera__video" ref={stream} autoPlay={true} />
      <span className="camera__score">Score: {score}</span>
    </div>
  );
}

export default Camera;
