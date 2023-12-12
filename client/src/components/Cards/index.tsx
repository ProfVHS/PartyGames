import "./style.scss";

import Card from "./Card";
import { useState } from "react";
import { Stopwatch } from "../Stopwatch/Stopwatch";

interface CardObject {
  isPositive: boolean;
  score: number;
}

function Cards() {
  const cards: CardObject[] = [
    { isPositive: true, score: 50 },
    { isPositive: true, score: 50 },
    { isPositive: false, score: 50 },
    { isPositive: false, score: 50 },
    { isPositive: true, score: 50 },

    { isPositive: true, score: 50 },
    { isPositive: true, score: 50 },
    { isPositive: true, score: 50 },
    { isPositive: false, score: 50 },
  ];

  const [flipped, setFlipped] = useState<boolean>(false);

  return (
    <div className="cards">
      <span className="cards__title">Cards</span>
      <span>Choose a card</span>
      <div className="cards__stopwatch">
        <Stopwatch maxTime={15} timeLeft={15} size={75} />
      </div>
      <div className="cardsWrapper" onClick={() => setFlipped(true)}>
        {cards.map((card, index) => (
          <Card
            key={index}
            isPositive={card.isPositive}
            flip={flipped}
            score={card.score}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default Cards;
