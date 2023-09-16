import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from "socket.io-client";

function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const location = useLocation();
  const username = location.state?.username;

  const socket = io("http://localhost:3000");

  useEffect(() => {
    socket.emit("join-room", roomCode, username);
  },[])


  return (
    <div>
      <h2>Lobby</h2>
      <p>Username: {username}</p>
      <p>Kod pokoju: {roomCode}</p>
    </div>
  );
}

export default Lobby;
