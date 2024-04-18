interface BestAnswerProps {
  bestAnswer: { user: string; answer: string };
}

export function BestAnswer({ bestAnswer }: BestAnswerProps) {
  return (
    <>
      <h1 className="buddies__header">The Best Answer</h1>
      <span className="buddies__bestAnswer-username">
        {bestAnswer.user} <span className="buddies__bestAnswer-points">+70</span>
      </span>
      <div className="buddies__bestAnswer-answer">{bestAnswer.answer}</div>
    </>
  );
}
