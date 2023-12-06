import "./style.scss";

import Card from "./Card";
import Stopwatch from "../Stopwatch";

import { useEffect, useState, useRef } from "react";

import { Socket } from "socket.io-client";
interface CardObject {
  isPositive: boolean;
  score: number;
}

interface SelectedCards {
  id: string;
  selectedCard: number;
}

interface CardsProps {
  socket: Socket;
  roomCode: string;
  users: { id: string; username: string; score: number; alive: boolean; id_room: string }[];
}

function Cards({ socket, roomCode, users }: CardsProps) {
  const [cards, setCards] = useState<CardObject[]>();
  const [time, setTime] = useState<number>(15);
  const [turn, setTurn] = useState<number>(1);
  const [selectedCards, setSelectedCards] = useState<SelectedCards[]>([]);

  const [flipped, setFlipped] = useState<boolean>(false);
  
  const onceDone = useRef<boolean>(false);

  // make sure that the game starts only once by host
  useEffect(() => {
    if(onceDone.current) return;

    const newTurn = turn + 1;
    setTurn(newTurn);

    if(users.length > 0){
      if(users[0].id === socket.id){
        const bombs_value = turn + 2;
        const cards_value = 7 - turn;
        socket.emit("startGameCards", { roomCode, bombs_value, cards_value } );
        socket.emit("timeCards", roomCode);
      }
    }

    onceDone.current = true;
  }, []);

  useEffect(() => {
    socket.on("receiveCardsArray", (data) => {
      setCards(data);   
    });
    socket.on("receiveTimeCards", (data) => {
      setTime(data);
    });
  }, [socket]);

  useEffect(() => {
    if (time === 0) {
      setFlipped(true); 
      setTimeout(() => {
        if(cards !== undefined){
          socket.emit("pointsCards", { roomCode, selectedCard, cards });
          socket.on("receivePointsCards", (data) => {
            console.log("Gracz: ", data.id, " wybrał: ", data.selectedCard);
            setSelectedCards((prev) => [...prev, data]);
          });
        }
      }, 3000);
      setTimeout(() => {
        setFlipped(false);
        setTime(15);
      }, 4000);
      if(turn <= 3){
        setTimeout(() => {
          const newTurn = turn + 1;
          setTurn(newTurn);
          if(users.length > 0){
            if(users[0].id === socket.id){
              const bombs_value = turn + 2;
              const cards_value = 7 - turn;
              socket.emit("startGameCards", { roomCode, bombs_value, cards_value } );
              socket.emit("timeCards", roomCode);
            }
          }
        }, 5000);   
      } else if(turn == 4){
        setTimeout(() => {
          socket.emit("endGameCards", roomCode);
        }, 6000);
      }

    }
  }, [time]);

  const [selectedCard, setSelectedCard] = useState<number>();

  const handleCardSelect = (id: number) => {
    setSelectedCard(id);
  };

  return (
    <div className="cards">
      <span className="cards__title">Cards</span>
      <span>Choose a card</span>
      <div className="cards__stopwatch">
        <Stopwatch timeLeft={time} maxTime={15} />
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
          />
        ))}
      </div>
    </div>
  );
}

export default Cards;
