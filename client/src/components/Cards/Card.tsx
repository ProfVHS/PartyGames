import { useEffect, useState } from "react";
import CardBack from "./CardBack";
import CardFrontPositive from "./CardFrontPositive";
import CardFrontNegative from "./CardFrontNegative";
import { Socket } from "socket.io-client";

interface CardProps {
  id: number;
  isPositive: boolean;
  flip: "FLIP" | "ALL" | "NONE";
  score: number;
  onSelect: (id: number) => void;
  selected: boolean;
  socket: Socket;
  roomCode: string;
  user: string;
}
export default function Card({ id, isPositive, flip, score, onSelect, selected, socket, roomCode, user }: CardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [frontShow, setFrontShow] = useState<boolean>(false);

  const handleClick = () => {
    if (flip !== "NONE") return;
    onSelect(id);
  };

  const handleFlip = (flip: "FLIP" | "ALL" | "NONE") => {
    if (flip === "NONE") return;
    if (flip === "ALL") {
      const newIsFlipped = flip === "ALL" ? true : false;
      setIsFlipped(newIsFlipped);

      setTimeout(() => {
        const newFrontShow = flip === "ALL" ? false : true;
        setFrontShow(newFrontShow);
        setIsFlipped(false);
      }, 400);
    }

    if (flip === "FLIP") {
      setTimeout(() => {
        const newIsFlipped = flip === "FLIP" ? true : false;
        setIsFlipped(newIsFlipped);

        setTimeout(() => {
          const newFrontShow = flip === "FLIP" ? true : false;
          setFrontShow(newFrontShow);
          setIsFlipped(false);
          if (user == socket.id) {
            socket.emit("checkCard", { roomCode, id });
          }
        }, 400);
      }, 400 * id);
    }
  };

  useEffect(() => {
    handleFlip(flip);
  }, [flip]);

  return (
    <div className={`cardBox ${isFlipped ? "flip" : ""} ${selected ? "cardBox selected" : ""}`} onClick={handleClick}>
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
