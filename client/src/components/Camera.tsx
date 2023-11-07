import "../styles/Camera.scss";

interface CameraProps {
  username: string;
  score: number;
}

function Camera({ username, score}: CameraProps) {
  
  return (
    <div className="camera">
      <span className="camera__username">{username}</span>
      <video className="camera__video" autoPlay={true} />
      <span className="camera__score">Score: {score}</span>
    </div>
  );
}

export default Camera;
