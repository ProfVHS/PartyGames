import "../../styles/Home.scss";
import "../../styles/Test.scss";

import { Link } from 'react-router-dom';
import { useState } from "react";

export default function HomePage() {

  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

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
        <Link to={`/lobby/${roomCode}`} >
          <button className="button" style={{ width: "48%" }} >
            Join
          </button>
        </Link>
        <input
          className="input"
          placeholder="Room Code"
          style={{ width: "48%" }}
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
          <Link to={`/lobby/${Math.round(Math.random() * (90000 - 10000) + 10000).toString()}`}>
            <button className="button" style={{ marginTop: "40px" }} >
              Create Room
            </button>
          </Link>
      </div>
    </div>
    </>
  );
}

