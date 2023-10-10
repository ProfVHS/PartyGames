import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import ClickSound from "../assets/audio/click.mp3";

const socket = io("http://localhost:3000");

export default function RoomPage() {

  const location = useLocation();

  const [value, setValue] = useState<number>(0);

  const username = location.state?.username;
  const roomCode:string = location.state?.randomRoomCode ? location.state?.randomRoomCode : location.state?.roomCode;
 
  const handleReadyClick = () => {
    new Audio(ClickSound).play();

  };

  useEffect(() => {
    socket.emit('joined', roomCode) 
  }, [])

  useEffect(() => {
    socket.on("users-in-room", (data) => {
      console.log(data);
    })
    
  }, [socket])

  return (
    <>
      <div className="roomGrid">
        <Camera username={username} score={420} />
        <div className="roomContent">
          <Lobby roomCode={roomCode?.toString()} onClick={handleReadyClick} players={value} />
          <AudioVideoControls />
        </div>
      </div>
    </>
  );
}
