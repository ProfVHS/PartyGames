import { useEffect, useState } from "react";
import CardBack from "./CardBack";
import CardFrontPositive from "./CardFrontPositive";
import CardFrontNegative from "./CardFrontNegative";

interface CardProps {
  id: number;
  isPositive: boolean;
  flip: boolean;
  score: number;
  onSelect: (id: number) => void;
  selected: boolean;
  endGame: boolean;
}
export default function Card({ id, isPositive, flip, score, onSelect, selected, endGame }: CardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [frontShow, setFrontShow] = useState<boolean>(false);

  const handleClick = () => {
    if(!flip){
      onSelect(id);
    };
  };

  const handleFlip = (flip: boolean) => {
    const index = endGame ? 1 : id;

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
    handleFlip(flip);
  }, [flip]);

  return (
    <div className={`cardBox ${isFlipped ?  "flip " : ""} ${selected ? " selected " : ""}`} onClick={handleClick} >
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
