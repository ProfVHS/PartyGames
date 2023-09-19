import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import ClickSound from "../assets/audio/click.mp3";

export default function RoomPage() {

  const socket = io("http://localhost:3000");

  const { roomCode } = useParams<{roomCode: string}>();
  const location = useLocation();
  const username = location.state?.username;

  const [value, setValue] = useState<number>(0);
  const [ready, setReady] = useState(false);

  const [userData, setUserData] = useState({
    video: "",
    audio: "",
    ready: ""
  });

  const handleReadyClick = () => {
    new Audio(ClickSound).play();

    const playerValue = 1;
    setReady(!ready); 
    socket.emit('changedValue', {ready, playerValue, roomCode});
  };

  useEffect(() => {
    socket.emit("join-room", roomCode, username);
    
    socket.on('updateValue', (v) => {
      setValue(value + v.playerValue);
      setReady(v.ready);
    });
  },[socket])

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

        <Lobby roomCode={roomCode?.toString()} onClick={handleReadyClick} players={value} />
      </div>
      <div className="gui">
        <AudioVideoControls />
      </div>
    </>
  );
}
