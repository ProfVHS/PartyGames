import { Question } from "./Question";
import { Answer } from "./Answer";
import { User } from "../../Types";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { AnswersSelect } from "./AnswersSelect";

import "./style.scss";
import { QuestionType } from "./Types";
import { Hourglass } from "../Hourglass";
import { useAnimate, usePresence } from "framer-motion";
import { BestAnswer } from "./BestAnswer";
import { ProgressBar } from "../ProgressBar";

interface BuddiesProps {
  roomCode: string;
  users: User[];
  onExit?: () => void;
}

type GameStatus =
  | "ANSWER"
  | "QUESTION"
  | "WAITINGANSWER"
  | "WAITINGQUESTION"
  | "SELECTANSWER"
  | "BESTANSWER";

const bestAnswerTimeMs = 5000;

let timeInterval: NodeJS.Timeout;

export function Buddies({ roomCode, users, onExit }: BuddiesProps) {
  const [writtenQuestion, setWrittenQuestion] = useState<boolean>(false);
  const [writtenAnswer, setWrittenAnswer] = useState<boolean>(false);
  const [question, setQuestion] = useState<QuestionType>({
    author: "",
    question: "",
  });
  const [bestAnswer, setBestAnswer] = useState<{
    user: string;
    answer: string;
  }>({ user: "", answer: "" });

  const [gameStatus, setGameStatus] = useState<GameStatus>("QUESTION");
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [time, setTime] = useState<"STOP" | number>("STOP");

  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  const onceDone = useRef(false);

  const [time, setTime] = useState<"STOP" | number>("STOP");
  let timeInterval: NodeJS.Timeout;

  useEffect(() => {
    if (isPresence) {
      const showUpElements = async () => {
        await animate(
          ".buddies__header",
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.5, type: "spring" }
        );
        animate(
          ".buddies__button",
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.8, type: "spring" }
        );
        await animate(
          ".buddies__input",
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.8, type: "spring" }
        );
      };
      const enterAnimation = async () => {
        await animate(scope.current, { scaleY: [0, 1] }, { duration: 0.5 });
        await showUpElements();
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(
          scope.current,
          { scale: [1, 0] },
          { duration: 0.5, type: "spring" }
        );
        safeToRemove();
        onExit && onExit();
      };
      exitAnimation();
    }
  }, [isPresence]);

  const isQuestionWritten = () => {
    setWrittenQuestion(true);
  };

  const isAnswerWritten = () => {
    setWrittenAnswer(true);
  };

  useEffect(() => {
    const isEveryUserHasQuestion = (data: GameStatus) => {
      setGameStatus(data);

      if (data === "ANSWER") {
        const host = users.find((user) => user.id === socket.id)?.is_host;

        if (!host) return;

        socket.emit("getQuestionsBuddies", roomCode);
      }
    };

    const isEveryUserHasAnswer = (data: GameStatus) => {
      setGameStatus(data);

      if (data === "SELECTANSWER") {
        const host = users.find((user) => user.id === socket.id)?.is_host;

        if (!host) return;

        socket.emit("getAnswersBuddies", roomCode);
      }
    };

    const receiveQuestion = (question: string, user: string) => {
      setQuestion({ author: user, question: question });
    };

    const receiveTheBestAnswer = (
      data: { user: string; answer: string },
      status: GameStatus
    ) => {
      setBestAnswer(data);
      setGameStatus(status);
      setTime(0);
    };

    const newRound = () => {
      setGameStatus("ANSWER");
      setWrittenAnswer(false);
    };

    const gameOver = () => {
      setGameOver(true);
    };

    socket.on("allQuestionsBuddies", isEveryUserHasQuestion);

    socket.on("allAnswersBuddies", isEveryUserHasAnswer);

    socket.on("receiveQuestionBuddies", receiveQuestion);

    socket.on("receiveTheBestAnswerBuddies", receiveTheBestAnswer);

    socket.on("newRoundBuddies", newRound);

    socket.on("receiveGameOver", gameOver);

    return () => {
      socket.off("allQuestionsBuddies", isEveryUserHasQuestion);
      socket.off("allAnswersBuddies", isEveryUserHasAnswer);
      socket.off("receiveQuestionBuddies", receiveQuestion);
      socket.off("newRoundBuddies", newRound);
    };
  }, [socket]);

  /* =========== Timer =========== */
  useEffect(() => {
    if (time === "STOP") return;
    timeInterval = setInterval(() => {
      if (time <= bestAnswerTimeMs) {
        const newTime = time + 10;
        setTime(newTime);
      } else {
        clearInterval(timeInterval);
        setBestAnswer({ user: "", answer: "" });
        setTime("STOP");
      }
    }, 10);

    return () => clearInterval(timeInterval);
  }, [time]);

  useEffect(() => {
    if (onceDone.current) return;

    const host = users.find((user) => user.id === socket.id)?.is_host;

    if (host) socket.emit("initBestBuddiesAnswers", roomCode);

    onceDone.current = true;
  }, []);

  /* =========== Timer =========== */
  useEffect(() => {
    if (time === "STOP") return;

    const host = users.find((user) => user.id === socket.id)?.is_host;

    timeInterval = setInterval(() => {
      if (time <= bestAnswerTimeMs) {
        const newTime = time + 10;
        setTime(newTime);
      } else {
        clearInterval(timeInterval);
        setBestAnswer({ user: "", answer: "" });
        setTime("STOP");

        if (!host) return;

        if (gameOver) {
          socket.emit("endGameBuddies", roomCode);
        } else {
          socket.emit("getQuestionsBuddies", roomCode);
        }
      }
    }, 10);

    return () => clearInterval(timeInterval);
  }, [time]);

  return (
    <div className="buddies" ref={scope}>
      {gameStatus === "QUESTION" && !writtenQuestion && (
        <Question
          roomCode={roomCode}
          users={users}
          onClick={isQuestionWritten}
        />
      )}
      {gameStatus === "QUESTION" && writtenQuestion && (
        <>
          <h3 className="buddies__waiting">
            Waiting for all players to ask the questions
          </h3>
          <Hourglass />
        </>
      )}
      {gameStatus === "ANSWER" &&
        !writtenAnswer &&
        socket.id !== question.author && (
          <Answer
            roomCode={roomCode}
            users={users}
            onClick={isAnswerWritten}
            question={question}
          />
        )}
      {gameStatus === "ANSWER" &&
        writtenAnswer &&
        socket.id !== question.author && (
          <>
            <h3 className="buddies__waiting">
              Waiting for all players to answer
            </h3>
            <Hourglass />
          </>
        )}
      {gameStatus === "ANSWER" && socket.id === question.author && (
        <>
          <h3 className="buddies__waiting">
            Waiting for players to answer to your question
          </h3>
          <Hourglass />
        </>
      )}
      {gameStatus === "SELECTANSWER" && (
        <AnswersSelect roomCode={roomCode} users={users} question={question} />
      )}
      {gameStatus === "BESTANSWER" && (
        <>
          <BestAnswer bestAnswer={bestAnswer} />
          <ProgressBar
            width="75%"
            max={bestAnswerTimeMs}
            progress={typeof time === "number" ? time : 0}
          />
        </>
      )}
    </div>
  );
}
