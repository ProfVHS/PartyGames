import { useEffect, useState } from "react";
import CardBack from "./CardBack";
import CardFrontPositive from "./CardFrontPositive";
import CardFrontNegative from "./CardFrontNegative";

interface CardProps {
  isPositive: boolean;
  flip: boolean;
  score: number;
  index: number;
}
export default function Card({ isPositive, flip, score, index }: CardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [frontShow, setFrontShow] = useState<boolean>(false);

  const handleFlip = (flip: boolean) => {
    setTimeout(() => {
      const newIsFlipped = flip;
      setIsFlipped(newIsFlipped);

      setTimeout(() => {
        const newFrontShow = flip;
        setFrontShow(newFrontShow);
        setIsFlipped(false);
      }, 325);
    }, 325 * index);
  };

  useEffect(() => {
    console.log("Card - " + flip);
    handleFlip(flip);
  }, [flip]);

  return (
    <div className={`cardBox ${isFlipped ? "flip" : ""}`}>
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
