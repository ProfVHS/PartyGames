import "../styles/Home.scss";

import Logo from "../assets/svgs/logo.svg";

import ClickSound from "../assets/audio/click.mp3";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Socket } from "socket.io-client";

interface HomePageProps {
  socket: Socket;
}

export default function HomePage({ socket }: HomePageProps) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [randomRoomCode, setRandomRoomCode] = useState("");
  const [roomExistence, setRoomExistence] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    setRandomRoomCode(
      Math.round(Math.random() * (90000 - 10000) + 10000).toString()
    );
  }, []);

  const inputHandler = (room: string) => {
    setRoomCode(room);
    socket.emit("checkRoomExistence", room);
    socket.on("roomExistenceResponse", (exists) => {
      setRoomExistence(exists);
    });
  };

  const startLoadingAnimation = () => {
    setIsLoading(true);
  };

  const JoinHandleClick = () => {
    new Audio(ClickSound).play();

    roomExistence ? socket.emit("join-room", roomCode, username) : "";
    startLoadingAnimation();
    setTimeout(() => {
      navigate("/lobby", { state: { username, roomCode } });
    }, 2250);
  };

  const CreateHandleClick = () => {
    new Audio(ClickSound).play();
    if (username) {
      username ? socket.emit("join-room", randomRoomCode, username) : "";
      startLoadingAnimation();
      setTimeout(() => {
        navigate("/lobby", { state: { username, randomRoomCode } });
      }, 2250);
    }
  };

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
        <button
          className="button"
          style={{ width: "50%" }}
          onClick={JoinHandleClick}
        >
          Join
        </button>
        <input
          className="input"
          placeholder="Room Code"
          style={{ width: "48%" }}
          value={roomCode}
          onChange={(e) => inputHandler(e.target.value)}
        />
        <button
          className="button"
          style={{ marginTop: "40px" }}
          onClick={CreateHandleClick}
        >
          Create Room
        </button>
      </div>
      {isLoading && <div className="home__loadingScreen">Party Games</div>}
    </div>
  );
}
