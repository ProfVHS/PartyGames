import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ClickSound from "../assets/audio/click.mp3";

import { Socket } from "socket.io-client";

import Peer from "peerjs";
interface RoomPageProps {
  socket: Socket;
}

export default function RoomPage({ socket }: RoomPageProps) {
  const location = useLocation();

  const [value, setValue] = useState(0);
  const [users, setUsers] = useState<[{id: string, username: string, score: number, id_room: string}]>([{id: "", username: "", score: 0, id_room: ""}]);
  const [ready, setReady] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  //const username = location.state?.username;
  const roomCode: string = location.state?.randomRoomCode
    ? location.state?.randomRoomCode
    : location.state?.roomCode;


  // const localStream = useRef<MediaStream | undefined>();
  // const remoteStream = useRef<MediaStream>();

  const handleReadyClick = () => {
    new Audio(ClickSound).play();

    setReady(!ready);
    
    const temp = ready ? value - 1 : value + 1;
  
    socket.emit("send_value", {roomCode , temp});

    socket.on("receive_value", (data) => {
      setValue(data);
    });
  };

  const localStream = useRef<HTMLVideoElement>(null);
  const remoteStream = useRef<HTMLVideoElement[]>(null);

  useEffect(() => {
    socket.emit("joined", roomCode);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
          if(localStream.current !== null){
            localStream.current.srcObject = currentStream;
          }
      }
    );

    const peer = new Peer(roomCode, {
      host: "/",
      port: 3001,
    });

    const conn = peer.connect(roomCode); 

    const call = peer.call(roomCode, localStream.current?.srcObject as MediaStream);   

    peer.on("connection", (conn) => {
      conn.on("open", () => {
        conn.send("hi!");
      });
    });

    conn.on("open", () => {
      conn.on('data', function(data) {
        console.log('Received', data);
      });

      conn.send('Hello!');
    });

    peer.on("call", (call) => {
      // call.answer(localStream.current?.srcObject as MediaStream);
      // call.on("stream", (stream) => { //here's where you get the stream
      //   const index = parseInt(call.peer);
      //   if(remoteStream.current !== null){
      //     remoteStream.current[index].srcObject = stream;
      //   }  
          
          
      //     ("#video-list").append("<video id='video-"+ call.peer +"' autoplay></video>"); 
          
      //     ("#video-"+ call.peer).prop("srcObject", stream); 
      // });
      

      call.answer(localStream.current?.srcObject as MediaStream);

      call.on("stream", (stream) => {
        const index = parseInt(call.peer);
        if(remoteStream.current !== null){
          remoteStream.current[index].srcObject = stream;
        }  
      });


    });
  }, []);

  useEffect(() => {
    socket.on("receive_users", (data) => {
      setUsers(data);
      console.log(data);
    });
    socket.on("recive_value", (data) => {
      setValue(value + data)
    })
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
            return <Camera 
            key={user.id} 
            stream={localStream}
            username={user.username} 
            score={user.score} 
            />;
          })}

        <div className="roomContent">
          <Lobby
            roomCode={roomCode?.toString()}
            onClick={handleReadyClick}
            players={value}
            isReady={ready}
          />
          <AudioVideoControls />
        </div>
      </div>
      
      {isLoading && <div className="room__loadingScreen">Party Games</div>}
    </>
  );
}
