import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

export default function RoomPage() {
  return (
    <>
      <div className="roomGrid">
        <Camera username="GMBLR" score={420} />
        <Camera username="GMBLR" score={420} />
        <Camera username="GMBLR" score={420} />
        <Camera username="GMBLR" score={420} />

        <Camera username="GMBLR" score={420} />
        <Camera username="GMBLR" score={420} />
        <Camera username="GMBLR" score={420} />
        <Camera username="GMBLR" score={420} />

        <Lobby roomCode="X1Y4Z3" />
      </div>
      <div className="gui">
        <AudioVideoControls />
      </div>
    </>
  );
}
