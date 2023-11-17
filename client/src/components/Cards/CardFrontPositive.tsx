interface CardFrontPositiveProps {
  score: number;
}

function CardFrontPositive({ score }: CardFrontPositiveProps) {
  return (
    <div className="card__front positive">
      <span className="card__front__corner left">+{score}</span>
      <span className="card__front__mid">+{score}</span>
      <span className="card__front__corner right">+{score}</span>
    </div>
  );
}

export default CardFrontPositive;
