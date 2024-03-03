import "../styles/Home.scss";

import Logo from "../assets/svgs/logo.svg";

import ClickSound from "../assets/audio/click.mp3";

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {socket} from "../socket";

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
  "Party",
  "Funny",
  "Crazy",
  "Happy",
  "Sad",
  "Angry",
  "Epic",
  "Legendary",
  "Pro",
  "Noob",
  "Dumb",
  "Smart",
  "Fast",
  "Slow",
  "Big",
  "Small",
  "Mr",
  "Mrs",
  "Sensei",
  "Master",
  "King",
  "Queen",
  "Lord",
  "Sir",
];
const nouns = [
  "Mango",
  "Monkey",
  "Kiwi",
  "Guy",
  "Bread",
  "Ninja",
  "Samurai",
  "Panda",
  "Potato",
  "Sigma",
  "Banana",
  "Cat",
  "Dog",
  "Cyclop",
  "Bro",
  "Dude",
  "Doc",
  "Buffalo",
  "Chicken",
  "Turtle",
  "Penguin",
  "Marcello",
  "Fernando Melo",
  "Amigo",
];

export default function HomePage() {
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [randomRoomCode, setRandomRoomCode] = useState("");
  const [roomExistence, setRoomExistence] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cookie_id = document.cookie;

  const navigate = useNavigate();

  useEffect(() => {
    handleRandomRoomCode();
  }, []);

  const handleRandomRoomCode = () => {
    setRandomRoomCode(
      (Math.random() + 1).toString(36).substring(7).toUpperCase()
    );
  };

  const inputHandler = (roomCode: string) => {
    setRoomCode(roomCode);
    socket.emit("checkRoomExistence", roomCode);
    socket.on("roomExistenceResponse", (exists) => {
      setRoomExistence(exists);
    });
  };

  const startLoadingAnimation = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/lobby", { state: { username, code } });
    }, 50);
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
      socket.emit("joinRoom", { roomCode, name, cookie_id });
      socket.on("joiningRoom", () => {
        startLoadingAnimation(roomCode);
      });
      socket.on("roomFull", () => {
        alert("Room is full");
      });
      socket.on("roomInGame", () => {
        alert("Room is in game");
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
        socket.emit("createRoom", name, randomRoomCode, cookie_id );
        startLoadingAnimation(randomRoomCode);
      }
    });
  };

  useEffect(() => {
    socket.emit('disconnectUser');
  }, []);

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
