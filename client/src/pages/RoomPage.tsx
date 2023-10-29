import AudioVideoControls from "../components/AudioVideoControls";
import Camera from "../components/Camera";
import Lobby from "../components/Lobby";

import "../styles/Room.scss";

import { useLocation } from "react-router-dom";
import { LegacyRef, useEffect, useRef, useState } from "react";
import ClickSound from "../assets/audio/click.mp3";

import { Socket } from "socket.io-client";

import Peer from 'simple-peer';


interface RoomPageProps {
  socket: Socket;
}

export default function RoomPage({ socket }: RoomPageProps) {
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [users, setUsers] = useState<{id: string, username: string, score: number, id_room: string}[]>([]);
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
  const remoteStream = useRef<HTMLVideoElement>(null);
    
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream.current!.srcObject = stream;



      socket.on("user_joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);

      });
    });


  }, []);

  const createPeer = (userToSignal: any, callerID:any, stream:any) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("send-signal", { userToSignal, callerID, signal });
    });

    return peer;  
  };

  const addPeer = (incomingSignal:any, callerID:any, stream:any) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("return-signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  useEffect(() => {
    socket.emit("joined", roomCode);
  }, []);

  useEffect(() => {
    socket.on("receive_users", (data) => {
      setUsers(data);
      console.log("Data - " ,data);
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
        {/* {users &&
          users.map((user) => {
            if(user.id == socket.id){
              return <Camera 
              key={user.id} 
              stream={localStream}
              username={user.username} 
              score={user.score} 
              />;
            } else {
              return <Camera 
              key={user.id} 
              stream={remoteStream}
              username={user.username} 
              score={user.score} 
              />;
            }
          })} */}
        {users &&
          peers.map((peer, index) => {
            return (
              <Camera
                key={index}
                stream={peer}
                username={users[index].username}
                score={users[index].score}
              />
            );
          })
        }
          
        
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

/*

  

    useEffect(() => {
      const peer = new Peer(socket.id, {
        host: "localhost",
        port: 9000,
      });

      

      users.forEach(user => {
        if(user.id !== socket.id){
          setConn(peer.connect(user.id));
          console.log("ForEach user - ", user);
        }
      });

      peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((currentStream) => {
              if(localStream.current !== null){
                localStream.current.srcObject = currentStream;
                localStream.current.play();
              } 
            call.answer(currentStream);
            call.on('stream', (stream) => {
              if(remoteStream.current !== null){
                remoteStream.current.srcObject = stream;
                remoteStream.current.play();
              }
            });
          }
        );
      });

      console.log("socket id - ", socket.id);
      console.log("Peer id - ", localidpeer.current);
      console.log("peer - ", peer);

      if(users.length > 1){
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((currentStream) => {
              if(localStream.current !== null){
                localStream.current.srcObject = currentStream;
                localStream.current.play();
              } 
          }
        );

        const call = peer.call(users[1].id, localStream.current?.srcObject as MediaStream);

        call.on('stream', (stream) => {
          if(remoteStream.current !== null){
            remoteStream.current.srcObject = stream;
            remoteStream.current.play();
          }
        });
      }
    }, [users]);*/