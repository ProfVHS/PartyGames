import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function RoomPage() {

  const { roomCode } = useParams<{roomCode: string}>();
  const location = useLocation();
  const username = location.state?.username;

  const socket = io("http://localhost:3000");

  useEffect(() => {
    socket.emit("join-room", roomCode, username);
  },[])

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

        <Lobby roomCode={roomCode?.toString()} />
      </div>
      <div className="gui">
        <AudioVideoControls />
      </div>
    </>
  );
}
