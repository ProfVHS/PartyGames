import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import ClickSound from "../assets/audio/click.mp3";

export default function RoomPage() {

  const socket = io("http://localhost:3000");

  const location = useLocation();

  const [value, setValue] = useState<number>(0);
  const [ready, setReady] = useState(false);

  const [score, setScore] = useState();
  
  const [players, setPlayers] = useState<string[]>([]);

  const username = location.state?.username;
  const roomCode = location.state?.randomRoomCode ? location.state?.randomRoomCode : location.state?.roomCode;
 
  const handleReadyClick = () => {
    new Audio(ClickSound).play();

  };

  socket.on("joined", (data:string) => {
    setPlayers(players => [...players, data]);
  })
  
  console.log(players);

  return (
    <>
      <div className="roomGrid">
        <Camera username={username} score={420} />

        <Lobby roomCode={roomCode?.toString()} onClick={handleReadyClick} players={value} />
      </div>
      <div className="gui">
        <AudioVideoControls />
      </div>
    </>
  );
}
