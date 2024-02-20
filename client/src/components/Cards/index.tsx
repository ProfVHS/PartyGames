import "./style.scss";

import Card from "./Card";
import { Stopwatch } from "../Stopwatch/Stopwatch";

import { useEffect, useState, useRef } from "react";
import { User, Room } from "../../Types";

import { socket } from "../../socket";
interface CardObject {
  isPositive: boolean;
  score: number;
}

interface CardsProps {
  roomCode: string;
  users: User[];
}

export function Cards({ roomCode, users }: CardsProps) {
  const [cards, setCards] = useState<CardObject[]>();
  const [time, setTime] = useState<number>(15);
  const [round, setRound] = useState<number>(1);
  const [selectedCard, setSelectedCard] = useState<number>(0);
  const [flipped, setFlipped] = useState<"FLIP" | "ALL" | "NONE">("NONE");

  const onceDone = useRef<boolean>(false);

  const startGame = async () => {
    if (users.length > 0) {
      if (users[0].id == socket.id) {
        socket.emit("startGameCards", roomCode);
        socket.emit("stopwatchTime", roomCode);
      }
    }
  };

  // make sure that the game starts only once by host
  useEffect(() => {
    if (onceDone.current) return;

    if (users.length > 0) {
      if (users[0].id === socket.id) {
        startGame();
      }
    }

    onceDone.current = true;
  }, []);

  // data from server (cards and time)
  useEffect(() => {
    const cardsArray = (data: CardObject[]) => {
      setTimeout(() => {
        setCards(data);
      }, 400);
    };

    const stopwatchTime = (data: number) => {
      setTime(data);
    };

    const roomData = (data: Room) => {
      setRound(data.round);
    };

    socket.on("receiveCardsArray", cardsArray);

    socket.on("receiveStopwatchTime", stopwatchTime);

    socket.on("receiveRoomData", roomData);

    return () => {
      socket.off("receiveCardsArray", cardsArray);
      socket.off("receiveStopwatchTime", stopwatchTime);
      socket.off("receiveRoomData", roomData);
    };
  }, [socket]);

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleGame = () => {
    setFlipped("FLIP");
    // send the selected card to the server (receive points)
    if (cards !== undefined) {
      socket.emit("selectedObject", selectedCard);
    }

    // flip the cards
    delay(4500).then(() => {
      // all cards at the same time flip back (animation Rafał)

      // the game ends after 3 turns
      if (users.length > 0) {
        if (users[0].id === socket.id) {
          if (round >= 3) {
            // end the game
            socket.emit("endGameCards", roomCode);
          } else {
            // next round
            socket.emit("endRoundCards", roomCode);
            startGame();
          }
        }
      }
      // flip the cards and reset the time
      setFlipped("ALL");
      setTimeout(() => {
        setFlipped("NONE");
      }, 100);
      setTime(15);
    });
  };

  useEffect(() => {
    if (time === 0) {
      handleGame();
    }
  }, [time]);

  const handleCardSelect = (id: number) => {
    setSelectedCard(id);
  };

  return (
    <div className="cards">
      <span className="cards__title">Cards</span>
      <span className="cards__round">Round: {round}</span>
      <div className="cards__stopwatch">
        <Stopwatch maxTime={15} timeLeft={time} size={75} />
      </div>
      <div className="cardsWrapper">
        {cards?.map((card, index) => (
          <Card
            key={index}
            id={index}
            isPositive={card.isPositive}
            flip={flipped}
            score={card.score}
            onSelect={handleCardSelect}
            selected={selectedCard === index}
            socket={socket}
            roomCode={roomCode}
            user={users[0].id}
          />
        ))}
      </div>
    </div>
  );
}
