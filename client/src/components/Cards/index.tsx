import "./style.scss";
import Card from "./Card";
import { Stopwatch } from "../Stopwatch/Stopwatch";
import { User, Room } from "../../Types";
import { socket } from "../../socket";

import { useEffect, useState, useRef } from "react";
import { useAnimate, usePresence, motion } from "framer-motion";
interface CardObject {
  isPositive: boolean;
  score: number;
}

interface CardsProps {
  roomCode: string;
  users: User[];
  onExit?: () => void;
}

export function Cards({ roomCode, users, onExit }: CardsProps) {
  const [cards, setCards] = useState<CardObject[]>();
  const [time, setTime] = useState<number>(10);
  const [round, setRound] = useState<number>(1);
  const [selectedCard, setSelectedCard] = useState<number>(0);
  const [flipped, setFlipped] = useState<"FLIP" | "ALL" | "NONE">("NONE");

  // Enter and exit animations
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresence) {
      const showUpElements = async () => {
        animate(".cards__title", { opacity: [0, 1], scale: [0, 1] }, { duration: 0.5, type: "spring" });
        animate(".cards__round", { opacity: [0, 1], scale: [0, 1] }, { duration: 0.5, type: "spring" });
        animate(".cards__stopwatch", { opacity: [0, 1], scale: [0, 1] }, { duration: 0.5, type: "spring" });
        await animate(".cardsWrapper", { opacity: [0, 1], scale: [0, 1] }, { duration: 0.5, type: "spring" });
      };
      const enterAnimation = async () => {
        await animate(scope.current, { height: ["0%", "100%"] }, { duration: 1, type: "spring" });
        await showUpElements();
      };
      enterAnimation();
    } else {
      const hideElements = async () => {
        animate(".cards__title", { opacity: [1, 0], scale: [1, 0] }, { duration: 0.5, type: "spring" });
        animate(".cards__round", { opacity: [1, 0], scale: [1, 0] }, { duration: 0.5, type: "spring" });
        animate(".cards__stopwatch", { opacity: [1, 0], scale: [1, 0] }, { duration: 0.5, type: "spring" });
        await animate(".cardsWrapper", { opacity: [1, 0], scale: [1, 0] }, { duration: 0.5, type: "spring" });
      };
      const exitAnimation = async () => {
        await hideElements();
        animate(scope.current, { opacity: [1, 0] }, { duration: 0.4, type: "spring", delay: 0.5 });
        await animate(scope.current, { height: ["100%", "0%"] }, { duration: 1, type: "spring" });
        safeToRemove();
        onExit && (await onExit());
      };
      exitAnimation();
    }
  }, [isPresence]);

  const onceDone = useRef<boolean>(false);

  const startGame = async () => {
    const host = users.find((user) => user.id == socket.id)?.is_host;

    if (host) {
      socket.emit("startGameCards", roomCode);
      socket.emit("stopwatchTime", roomCode);
    }
  };

  // make sure that the game starts only once by host
  useEffect(() => {
    if (onceDone.current) return;

    const host = users.find((user) => user.id == socket.id)?.is_host;

    socket.emit("addUsersToLowestBalance", roomCode);

    if (host) {
      startGame();
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

      const host = users.find((user) => user.id == socket.id)?.is_host;

      if (host) {
        if (round >= 3) {
          // end the game
          socket.emit("endGameCards", roomCode);
        } else {
          // next round
          socket.emit("endRoundCards", roomCode);
          startGame();
        }
      }

      // flip the cards and reset the time
      setFlipped("ALL");
      setTimeout(() => {
        setFlipped("NONE");
      }, 100);
      setTime(10);
    });
  };

  useEffect(() => {
    if (time === 0) {
      handleGame();
    }
  }, [time]);

  useEffect(() => {
    if (!cards) {
      socket.emit("getCards", roomCode);
    }
  }, [window.onload]);

  const handleCardSelect = (id: number) => {
    setSelectedCard(id);
  };

  return (
    <div className="cards" ref={scope}>
      <motion.span className="cards__title" initial={{ scale: 0, opacity: 0 }}>
        Cards
      </motion.span>
      <motion.span className="cards__round" initial={{ scale: 0, opacity: 0 }}>
        Round: {round}
      </motion.span>
      <motion.div className="cards__stopwatch" initial={{ scale: 0, opacity: 0 }}>
        <Stopwatch maxTime={10} timeLeft={time} size={75} />
      </motion.div>
      <motion.div className="cardsWrapper" initial={{ scale: 0, opacity: 0 }}>
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
            user={users.find((user) => user.is_host == true)?.id}
          />
        ))}
      </motion.div>
    </div>
  );
}
