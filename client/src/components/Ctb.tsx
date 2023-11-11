import React, { useEffect, useState } from "react";
import "../styles/Ctb.scss";

import c4 from "../assets/svgs/C4.svg";

import ClickSound from "../assets/audio/click.mp3";
import { Socket } from "socket.io-client";

interface CtbProps {
  socket: Socket;
  roomCode: string;
  users: {id: string, username: string, score: number, id_room: string}[];
}
export default function Ctb({ socket, roomCode, users }: CtbProps) {
  const [counter, setCounter] = useState<number>(0);
  const [yourTurn, setYourTurn] = useState<boolean>(false);
  const [turn, setTurn] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);

  const handleTurn = (bool: boolean) => {
    setYourTurn(bool);
  };

  const handleClickButton = () => {
    new Audio(ClickSound).play();
    setClicked(true);
    socket.emit("send_ctb_counter", roomCode);
  };

  const handleSkipButton = () => {
    new Audio(ClickSound).play();
    setClicked(false);
    setYourTurn(false);
    socket.emit("send_change_ctb_turn", roomCode);
  };

  useEffect(() => {
    socket.emit("send_ctb_turn", roomCode);
    socket.on("receive_ctb_turn", (data) => {
      setTurn(data.username);
      if(data.id == socket.id){
        handleTurn(true);
      }
    });
    socket.on("receive_ctb_counter", (data) => {
      setCounter(data);
    });
    socket.on("receive_ctb_end", (data) => {
      setClicked(false);
      setYourTurn(false);
      setIsEndGame(true);
      console.log(data);
    });
  }, []);

  useEffect(() => {
    // if(username === turn){
    //   handleTurn(true);
    // } else {
    //   handleTurn(false);
    // }

    // users.forEach((user) => {
    //   if(user.id === socket.id){
    //     if(user.username === turn){
    //       handleTurn(true);
    //     } else {
    //       handleTurn(false);
    //     }
    //   }
    // });
  }, []);

  setTimeout(() => {

  }, 2000);

  return (
    <div className="ctb">
      {!isEndGame && (<>
        <span className="ctb__gamename">Click The Bomb</span>
        <span className="ctb__turn">{turn}'s turn</span>
        <div className="ctb__c4">
          <img src={c4} />
          <span className="ctb__c4__counter">
            {counter < 10 ? "0" + counter : counter}
          </span>
        </div>
        <div className="ctb__buttonbox">
          <button
            className="ctb__button click"
            onClick={handleClickButton}
            disabled={!yourTurn}
          >
            Click
          </button>
          <button
            className="ctb__button skip"
            onClick={handleSkipButton}
            disabled={!clicked}
          >
            {">"}
          </button>
        </div>
      </>)}
      {isEndGame && (<>
        <div>Koniec</div>
      </>)}
      
    </div>
  );
}