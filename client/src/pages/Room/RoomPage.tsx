import Camera from "../../components/Camera/Camera";
import Lobby from "../../components/Lobby";

import "./style.scss";

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ClickSound from "../../assets/audio/click.mp3";

import { User, Room } from "../../Types";
import MiniGames from "../../components/MiniGames";
import { socket } from "../../socket";
import LastUserNotification from "../../components/LastUserNotification/LastUserNotification";

export default function RoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usersReady, setUsersReady] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [roomData, setRoomData] = useState<Room | null>();
  const [ready, setReady] = useState(false);

  const usersLength = useRef<number>(0);
  const readyLength = useRef<number>(0);
  const [startGame, setStartGame] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [windowSizeX, setWindowSizeX] = useState<number>(0);
  const [windowSizeY, setWindowSizeY] = useState<number>(0);

  //const username = location.state?.username;
  const roomCode: string = location.state?.code;

  // Ready button
  const handleReadyClick = async () => {
    new Audio(ClickSound).play();

    setReady(!ready);

    socket.emit("usersReady", { roomCode, ready });
  };

  // Resize window (Frontend)
  const handleResize = () => {
    const newWindowSizeX = window.innerWidth;
    const newWindowSizeY = window.innerHeight;
    setWindowSizeX(newWindowSizeX);
    setWindowSizeY(newWindowSizeY);
  };

  useEffect(() => {
    // check if all players are ready (must be at least 2 players)
    if (readyLength.current == usersLength.current && readyLength.current > 1) {
      // change lobby to mini games
      setStartGame(true);
    }
  }, [usersReady]);

  useEffect(() => {
    socket.emit("usersData", roomCode);
    socket.emit("roomData", roomCode);

    handleResize();
    window.addEventListener("resize", () => {
      handleResize();
    });
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Users data
    socket.on("receiveUsersData", (data) => {
      setUsers(data);
      usersLength.current = data.length;
    });
    // Room data (players ready)
    socket.on("receiveRoomData", (data) => {
      setRoomData(data);
      setUsersReady(data.ready);
      readyLength.current = data.ready;
    });
    //
    socket.on("receiveUserIsInRoom", (data) => {
      if (!data) {
        navigate("/");
      }
    });
    // User disconnected
    socket.on("userDisconnectedRoom", (data) => {
      console.log(data + " has left the room");
    });
    //
    socket.on("waitForOtherPlayers", () => {
      console.log("Waiting for other players...");
      setIsOpen(true);
    });

    return () => {
      socket.off("receiveUsersData");
      socket.off("receiveRoomData");
      socket.off("user_disconnected");
      socket.off("receiveUserIsInRoom");
    };
  }, [socket]);

  const handleUserDisconnect = (username: string) => {};

  setTimeout(() => {
    setIsLoading(false);
  }, 50);

  useEffect(() => {
    socket.emit("checkIfUserIsInRoom", roomCode);
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", () => {
      window.location.href = "/";
    });
  });



  return (
    <>
      <LastUserNotification isOpen={isOpen} />
      <div className="roomGrid">
        {windowSizeX > 800 &&
          windowSizeY > 600 &&
          users &&
          users.map((user) => {
            return <Camera key={user.id} username={user.username} score={user.score} />;
          })}
        <div className="roomContent">
          {startGame && <MiniGames roomCode={roomCode} users={users} roomData={roomData!} />}
          {!startGame && <Lobby roomCode={roomCode} onClick={handleReadyClick} players={usersReady} isReady={ready} />}
        </div>
      </div>

      {isLoading && <div className="room__loadingScreen">Party Games</div>}
    </>
  );
}
