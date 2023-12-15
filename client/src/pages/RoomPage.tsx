import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ClickSound from "../assets/audio/click.mp3";


import MiniGames from "../components/MiniGames";
import {socket} from "../socket";


export default function RoomPage() {
  const location = useLocation();
  const [usersReady, setUsersReady] = useState(0);
  const [users, setUsers] = useState<
    { id: string; username: string; score: number; alive: boolean; id_room: string }[]
  >([]);
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
    if(readyLength.current == usersLength.current && readyLength.current > 1){
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

  useEffect(() => {
    // Users data
    socket.on("receiveUsersData", (data) => {
      setUsers(data);
      usersLength.current = data.length;
      console.log(data);
    });
    // Room data (players ready)
    socket.on("receiveRoomData", (data) => {
      setUsersReady(data.ready);
      readyLength.current = data.ready;
    });
    // User disconnected
    // socket.on("user_disconnected", (data) => {
    //   alert(data[0].username + " has left the room");
    // });
    
  }, [socket]);

  setTimeout(() => {
    setIsLoading(false);
  }, 50);

  return (
    <>
      <div className="roomGrid">
        {windowSizeX > 800 &&
          windowSizeY > 600 &&
          users &&
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
          {startGame && 
            <MiniGames 
              socket={socket} 
              users={users} 
              roomCode={roomCode}
            />
          }
          {!startGame &&
            <Lobby
              roomCode={roomCode?.toString()}
              onClick={handleReadyClick}
              players={usersReady}
              isReady={ready} 
            />
          }
          
          <AudioVideoControls />
        </div>
      </div>

      {isLoading && <div className="room__loadingScreen">Party Games</div>}
    </>
  );
}
