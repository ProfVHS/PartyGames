import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ClickSound from "../assets/audio/click.mp3";

import { Socket } from "socket.io-client";

interface RoomPageProps {
  socket: Socket;
}

export default function RoomPage({ socket }: RoomPageProps) {
  const location = useLocation();

  const [value, setValue] = useState<number>(0);

  const [users, setUsers] = useState<[]>([]);

  //const username = location.state?.username;
  const roomCode: string = location.state?.randomRoomCode
    ? location.state?.randomRoomCode
    : location.state?.roomCode;

  const handleReadyClick = () => {
    new Audio(ClickSound).play();
  };

  useEffect(() => {
    console.log("test1");
    socket.on("receive_users", (data) => {
      console.log(data);
      setUsers(data.users);
    });
  }, [socket]);

  return (
    <>
      <div className="roomGrid">
        {users &&
          users.map((user) => {
            return <Camera key={user} username={user} score={0}></Camera>;
          })}
        <div className="roomContent">
          <Lobby
            roomCode={roomCode?.toString()}
            onClick={handleReadyClick}
            players={value}
          />
          <AudioVideoControls />
        </div>
      </div>
    </>
  );
}
