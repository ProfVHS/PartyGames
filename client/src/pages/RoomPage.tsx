import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

export default function RoomPage() {
  return (
    <div className="roomWrapper">
      <Camera username="GMBLR" score={420} />
      <Lobby roomCode="X1Y4Z3" />
    </div>
  );
}
