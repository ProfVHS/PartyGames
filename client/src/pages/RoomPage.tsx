import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useState } from "react";
import { io } from "socket.io-client";

import ClickSound from "../assets/audio/click.mp3";

export default function RoomPage() {
  const socket = io("http://localhost:3000");

  const location = useLocation();

  const [value, setValue] = useState<number>(0);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const username = location.state?.username;
  const roomCode = location.state?.roomCode;

  const handleReadyClick = () => {
    new Audio(ClickSound).play();
  };

  console.log(roomCode);

  setTimeout(() => {
    setIsLoading(false);
  }, 1995);

  return (
    <>
      <div className="roomGrid">
        <Camera username={username} score={420} />
        <div className="roomContent">
          <Lobby
            roomCode={roomCode?.toString()}
            onClick={handleReadyClick}
            players={value}
          />
          <AudioVideoControls />
        </div>
      </div>
      {isLoading && <div className="room__loadingScreen">Party Games</div>}
    </>
  );
}
