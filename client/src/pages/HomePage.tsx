import "../styles/Home.scss";

import Logo from "../assets/svgs/logo.svg";

import ClickSound from "../assets/audio/click.mp3";

import { Link } from 'react-router-dom';
import { useState } from "react";

import { io } from "socket.io-client";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomExistence, setRoomExistence] = useState(false);

  const socket = io("http://localhost:3000");

  const inputHandler = (room:string) => {
    setRoomCode(room);
    socket.emit("checkRoomExistence", room);
    socket.on("roomExistenceResponse", (exists) => {
      setRoomExistence(exists);
    });
  };
   
  const JoinHandleClick = () => {
    new Audio(ClickSound).play();
    
    roomExistence ? socket.emit("join-room", roomCode, username) : '';
  };

  const CreateHandleClick = () => {
    new Audio(ClickSound).play();
    
  }

  return (
    <div className="box">
      <img src={Logo} />
      <span className="name">Party Games</span>
      <div className="formWrapper">
        <input
          className="input"
          placeholder="Username"
          style={{ marginBottom: "60px", marginTop: "40px" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Link 
          style={{width: "48%"}}
          to={roomExistence ? `/lobby/` : "/"} 
          state={{username, roomCode}} 
        >
          <button
            className="button"
            style={{ width: "100%" }}
            onClick={JoinHandleClick}
          >
            Join
          </button>
        </Link>
        <input
          className="input"
          placeholder="Room Code"
          style={{ width: "48%" }}
          value={roomCode}
          onChange={(e) => inputHandler(e.target.value)}
        />
        <Link 
          style={{width: "100%"}}
          to={`/lobby/`} 
          state={{username, roomCode}}
        >
          <button
            className="button"
            style={{ marginTop: "40px" }}
            onClick={CreateHandleClick}
          >
            Create Room
          </button>
        </Link>
      </div>
    </div>
  );
}