import "../../styles/Home.scss";
import "../../styles/Test.scss";

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

  return (
    <>
      <div className="box">
      
      <span className="name">Party Games</span>
      <div className="formWrapper">
        <input
          className="input"
          placeholder="Username"
          style={{ marginBottom: "60px", marginTop: "40px" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Link to={roomExistence ? `/lobby/${roomCode}` : "/"} state={{username}} >
          <button className="button" style={{ width: "48%" }} >
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
          <Link to={`/lobby/${Math.round(Math.random() * (90000 - 10000) + 10000).toString()}`} state={{username}}>
            <button className="button" style={{ marginTop: "40px" }} >
              Create Room
            </button>
          </Link>
      </div>
    </div>
    </>
  );
}

