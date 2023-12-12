import "../styles/Camera.scss";
import { motion } from "framer-motion";

interface CameraProps {
  username: string;
  score: number;
}

function Camera({ username, score }: CameraProps) {
  return (
    <motion.div
      className="camera"
      initial={{ scale: 0.0 }}
      animate={{ scale: [0.0, 1.0] }}
      transition={{ duration: 1, type: "spring" }}
    >
      <span className="camera__username">{username}</span>
      <video className="camera__video" autoPlay={true} />
      <span className="camera__score">Score: {score}</span>
    </motion.div>
  );
}

export default Camera;
