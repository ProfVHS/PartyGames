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
}
export default function Card({ id, isPositive, flip, score, onSelect, selected }: CardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [frontShow, setFrontShow] = useState<boolean>(false);

  const handleClick = () => {
    if(!flip){
      onSelect(id);
    };
  };

  const handleFlip = (flip: boolean) => {
    setTimeout(() => {
      const newIsFlipped = flip;
      setIsFlipped(newIsFlipped);

      setTimeout(() => {
        const newFrontShow = flip;
        setFrontShow(newFrontShow);
        setIsFlipped(false);
      }, 325);
    }, 325 * id);
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
