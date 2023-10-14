import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ClickSound from "../assets/audio/click.mp3";

import { Socket } from "socket.io-client";
import Ctb from "../components/Ctb";

interface RoomPageProps {
  socket: Socket;
}

export default function RoomPage({ socket }: RoomPageProps) {
  const location = useLocation();

  const [value, setValue] = useState<number>(0);
  const [users, setUsers] = useState<[]>([]);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  //const username = location.state?.username;
  const roomCode: string = location.state?.randomRoomCode
    ? location.state?.randomRoomCode
    : location.state?.roomCode;

  useEffect(() => {
    socket.emit("joined", roomCode);
  }, []);

  useEffect(() => {
    socket.on("receive_users", (data) => {
      setUsers(data.users);
    });
  }, [socket]);

  const handleReadyClick = () => {
    new Audio(ClickSound).play();
    const newReady = !ready;
    setReady(newReady);
  };

  setTimeout(() => {
    setIsLoading(false);
  }, 1995);

  return (
    <>
      <div className="roomGrid">
        {users &&
          users.map((user) => {
            return <Camera key={user} username={user} score={0}></Camera>;
          })}
        <div className="roomContent">
          {/* <Lobby
            roomCode={roomCode?.toString()}
            onClick={handleReadyClick}
            players={value}
            isReady={ready}
          /> */}
          <Ctb turn="ultra mango guy" />
          <AudioVideoControls />
        </div>
      </div>
      {isLoading && <div className="room__loadingScreen">Party Games</div>}
    </>
  );
}
