import "../styles/Home.scss";

import Logo from "../assets/svgs/logo.svg";

import ClickSound from "../assets/audio/click.mp3";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Socket } from "socket.io-client";

interface HomePageProps {
  socket: Socket;
}

const adjective = [
  "Ultra",
  "Super",
  "Cool",
  "Magic",
  "Banana",
  "Boring",
  "Lazy",
  "Strong",
  "Infinity",
];
const nouns = [
  "Mango",
  "Monkey",
  "Guy",
  "Bread",
  "Ninja",
  "Sigma",
  "Banana",
  "Cat",
  "Dog",
  "Cyclop",
  "Bro",
];

export default function HomePage({ socket }: HomePageProps) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [randomRoomCode, setRandomRoomCode] = useState("");
  const [roomExistence, setRoomExistence] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    handleRandomRoomCode();
  }, []);

  const handleRandomRoomCode = () => {
    setRandomRoomCode(
      Math.round(Math.random() * (90000 - 10000) + 10000).toString()
    );
  };

  const inputHandler = (room: string) => {
    setRoomCode(room);
    socket.emit("checkRoomExistence", room);
    socket.on("roomExistenceResponse", (exists) => {
      setRoomExistence(exists);
    });
  };

  const startLoadingAnimation = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/lobby", { state: { username, code } });
    }, 2250);
  };

  const JoinHandleClick = () => {
    new Audio(ClickSound).play();
    

    if (roomExistence) {
      const randomUsername =
        adjective[Math.floor(Math.random() * adjective.length)] +
        " " +
        nouns[Math.floor(Math.random() * nouns.length)];
      const name = username ? username : randomUsername;
      new Audio(ClickSound).play();
      socket.emit("joinRoom", { roomCode, name });
      socket.on("roomNotFull", () => {
        startLoadingAnimation(roomCode);
      });
      socket.on("roomFull", () => {
        alert("Room is full");
      });
    } else {
      alert("Room doesn't exist");
    }
  };

  const CreateHandleClick = () => {
    socket.emit("checkRoomExistence", randomRoomCode);
    socket.on("roomExistenceResponse", (exists) => {
      if (exists) {
        handleRandomRoomCode();
        CreateHandleClick();
      } else {
        const randomUsername = adjective[Math.floor(Math.random() * adjective.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)]
        const name = username ? username : randomUsername;
        new Audio(ClickSound).play();
        socket.emit("createRoom", { name, randomRoomCode });
        startLoadingAnimation(randomRoomCode);
      }
    });
  };

  return (
    <div className="home">
      <img src={Logo} className="home__logo" />
      <span className="home__name">Party Games</span>
      <div className="home__formWrapper">
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
