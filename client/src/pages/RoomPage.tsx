import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ClickSound from "../assets/audio/click.mp3";

import { Socket } from "socket.io-client";

import MiniGames from "../components/MiniGames";

interface RoomPageProps {
  socket: Socket;
}

export default function RoomPage({ socket }: RoomPageProps) {
  const location = useLocation();
  const [playersReady, setPlayersReady] = useState(0);
  const [users, setUsers] = useState<
    { id: string; username: string; score: number; id_room: string }[]
  >([]);
  const [ready, setReady] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  //const username = location.state?.username;
  const roomCode: string = location.state?.code

  const handleReadyClick = () => {
    new Audio(ClickSound).play();

    setReady(!ready);
    const newPlayersReady = ready ? -1 : 1;

    socket.emit("send_value", {roomCode , newPlayersReady});
  };         

  useEffect(() => {
    socket.emit("joined", roomCode);
  }, []);

  useEffect(() => {
    socket.on("receive_users_data", (data) => {
      setUsers(data);
      console.log("Data - ", data);
    });
    socket.on("receive_room_data", (data) => {
      setPlayersReady(data.ready);
    });
    socket.on("recive_value", (data) => {
      const newPlayersReady = playersReady + data;
      setPlayersReady(newPlayersReady);
    });
    socket.on("user_disconnected", (data) => {
      alert(data[0].username + " has left the room");
    });
  }, [socket]);

  setTimeout(() => {
    setIsLoading(false);
  }, 1995);

  return (
    <>
      <div className="roomGrid">
        {users &&
          users.map((user) => {
            return (
              <Camera
                key={user.id}
                username={user.username}
                score={user.score}
              />
            );
          })}
        <div className="roomContent">
          {(playersReady == users.length && playersReady !== 1)
          ? <MiniGames 
            socket={socket}
            users={users}
            roomCode={roomCode}
            /> 
          : <Lobby
            roomCode={roomCode?.toString()}
            onClick={handleReadyClick}
            players={playersReady}
            isReady={ready}
            />}
          <AudioVideoControls />
        </div>
      </div>

      {isLoading && <div className="room__loadingScreen">Party Games</div>}
    </>
  );
}
