import "./style.scss";

import Card from "./Card";
import Stopwatch from "../Stopwatch";

import { useEffect, useState, useRef } from "react";
import { User } from "../../Types";

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
  users: User[];
}

function Cards({ socket, roomCode, users }: CardsProps) {
  const [cards, setCards] = useState<CardObject[]>();
  const [time, setTime] = useState<number>(5);
  const [turn, setTurn] = useState<number>(0);
  const [selectedCard, setSelectedCard] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  
  const onceDone = useRef<boolean>(false);

  const startGame = async () => {
    if(users.length > 0){
      if(users[0].id == socket.id){
        const newTurn = turn + 1;
        setTurn(newTurn);
        console.log("start game", turn);
        const bombs_value = turn + 3;
        const cards_value = 6 - turn;
        socket.emit("startGameCards", { roomCode, bombs_value, cards_value } );
        socket.emit("timeCards", roomCode);
      }
    }
  };

  // make sure that the game starts only once by host
  useEffect(() => {
    if(onceDone.current) return;

    if(users.length > 0){
      if(users[0].id === socket.id){
        startGame();
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

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleGame = () => {
      setFlipped(true);
      // send the selected card to the server (receive points)
      if(cards !== undefined){
        socket.emit("selectedCards", selectedCard);
      }

      // flip the cards
      delay(4500).then(() => {
        console.log("done");
        console.log(turn);
        // all cards at the same time flip back (animation Rafał)

         // the game ends after 3 turns
        if(turn > 2){
          // end the game
          if(users.length > 0){
            if(users[0].id === socket.id){
              socket.emit("endGameCards", { roomCode, cards });
              return;
            }
          }
        } 
        startGame();
        // flip the cards and reset the time
        setFlipped(false);
        setTime(5);
      });
  };

  useEffect(() => {
    if(time === 0) {
      handleGame();
    };
  }, [time]);

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
            socket={socket}
            room={roomCode}
            user={users[0].id}
          />
        ))}
      </div>
    </div>
  );
}

export default Cards;
