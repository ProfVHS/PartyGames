import MineSvg from "./MineSvg";

interface CardFrontNegativeProps {
  score: number;
}

function CardFrontNegative({ score }: CardFrontNegativeProps) {
  return (
    <div className="card__front negative">
      <span className="card__front__corner left">-{score}</span>
      <MineSvg height={75} />
      <span className="card__front__corner right">-{score}</span>
    </div>
  );
}

export default CardFrontNegative;
