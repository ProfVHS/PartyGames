import { useEffect } from "react";
interface BestAnswerProps {
  bestAnswer: {user: string, answer: string};
}

export function BestAnswer({ bestAnswer }: BestAnswerProps) {

  return (
    <>
        <h1 className="buddies__header">The Best Answer</h1>
        <h2>{bestAnswer.user}</h2>
        <button className="buddies__button" disabled={true}>
            {bestAnswer.answer}
        </button>
    </>
  );
}
