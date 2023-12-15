import { useEffect, useState } from "react";
import CardBack from "./CardBack";
import CardFrontPositive from "./CardFrontPositive";
import CardFrontNegative from "./CardFrontNegative";
import { Socket } from "socket.io-client";

interface CardProps {
  id: number;
  isPositive: boolean;
  flip: boolean;
  score: number;
  onSelect: (id: number) => void;
  selected: boolean;
  socket: Socket;
  room: string;
  user: string; 
}
export default function Card({ id, isPositive, flip, score, onSelect, selected, socket, room, user }: CardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [frontShow, setFrontShow] = useState<boolean>(false);

  const handleClick = () => {
    if(!flip){
      onSelect(id);
    };
  };

  const handleFlip = (flip: boolean) => {
    if(!flip) return;
    setTimeout(() => {
      const newIsFlipped = flip;
      setIsFlipped(newIsFlipped);

      setTimeout(() => {
        const newFrontShow = flip;
        setFrontShow(newFrontShow);
        setIsFlipped(false);
        if(user == socket.id){
          socket.emit("checkCard", { room, id });
        }
        // if(id == 9){
        //   // robi ture
        //   if(tura <= 3){

        //   } else {
        //     if(user == socket.id){
        //       socket.emit("endGameCards", room);
        //     }
        //   }
        // }
      }, 400);
    }, 400 * id);
  };

  useEffect(() => {
    handleFlip(flip);
  }, [flip]);

  return (
    <div className={`cardBox ${isFlipped ? "flip" : ""} ${selected ? "cardBox selected" : ""}`} onClick={handleClick} >
      {frontShow ? (
        isPositive ? (
          <CardFrontPositive score={score} />
        ) : (
          <CardFrontNegative score={score} />
        )
      ) : (
        <CardBack />
      )}
    </div>
  );
}
