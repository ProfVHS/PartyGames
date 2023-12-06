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
  const [turn, setTurn] = useState<number>(3);
  const [selectedCard, setSelectedCard] = useState<number>(0);
  const [selectedCards, setSelectedCards] = useState<SelectedCards[]>([]);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [endGame, setEndGame] = useState<boolean>(false);
  
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

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleGame = async () => {
    if(time === 0){
      setFlipped(true);

      // send the selected card to the server (receive points)
      if(cards !== undefined){
        socket.emit("selectedCards", { roomCode, selectedCard });
        // socket.on("receivePointsCards", (data) => {
        //   console.log("Gracz: ", data.id, " wybrał: ", data.selectedCard);
        //   setSelectedCards((prev) => [...prev, data]);
        // });
        const newEndGame = true;
        setEndGame(newEndGame);
      }

      await delay(1000);

      // the game ends after 3 turns
      if(turn <= 3){
        // flip the cards and reset the time
        setFlipped(false);
        setTime(5);
      } else if(turn == 4){
        // end the game
        if(users.length > 0){
          if(users[0].id === socket.id){
            socket.emit("endGameCards", { roomCode, cards });
          }
        }
      }

      
    }
  };

  useEffect(() => {
    // // if time is 0, end the game
    // if (time === 0) {
    //   // show the cards
    //   setFlipped(true); 
    //   // send the selected card to the server (receive points)
    //   setTimeout(() => {
    //     if(cards !== undefined){
    //       socket.emit("selectedCards", { roomCode, selectedCard, cards });
    //       socket.on("receivePointsCards", (data) => {
    //         console.log("Gracz: ", data.id, " wybrał: ", data.selectedCard);
    //         setSelectedCards((prev) => [...prev, data]);
    //       });
    //       const newEndGame = true;
    //       setEndGame(newEndGame);
    //     }
    //   }, 3000);
    //   // reset the time and flip the cards
    //   setTimeout(() => {
    //     setFlipped(false);
    //     setTime(5);
    //   }, 4000);
    //   // the game ends after 3 turns
    //   if(turn <= 3){
    //     setTimeout(() => {
    //       // set new Turn
    //       const newTurn = turn + 1;
    //       setTurn(newTurn);
    //       // start the game again with new cards (host)
    //       if(users.length > 0){
    //         if(users[0].id === socket.id){
    //           const bombs_value = turn + 2;
    //           const cards_value = 7 - turn;
    //           socket.emit("startGameCards", { roomCode, bombs_value, cards_value } );
    //           socket.emit("timeCards", roomCode);
    //         }
    //       }
    //       const newEndGame = false;
    //       setEndGame(newEndGame);
    //     }, 5000);   
    //   } else if(turn == 4){
    //     setTimeout(() => {
    //       // end the game
    //       socket.emit("endGameCards", roomCode);
    //     }, 6000);
    //   }

    // }
    handleGame();
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
            endGame={endGame}
          />
        ))}
      </div>
    </div>
  );
}

export default Cards;
