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

const bestAnswerTimeMs = 5000;

export function Buddies({ roomCode, users, onExit }: BuddiesProps) {
  const [allUsersWrittenQuestion, setAllUsersWrittenQuestion] = useState<number>(0);
  const [allUsersWrittenAnswer, setAllUsersWrittenAnswer] = useState<number>(0);
  const [writtenQuestion, setWrittenQuestion] = useState<boolean>(false);
  const [writtenAnswer, setWrittenAnswer] = useState<boolean>(false);
  const [question, setQuestion] = useState<QuestionType>({ author: "", question: "" });

  const [bestAnswer, setBestAnswer] = useState<{ user: string; answer: string }>({ user: "", answer: "" });
  const [endGame, setEndGame] = useState<boolean>(false);

  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  const onceDone = useRef(false);

  const [time, setTime] = useState<"STOP" | number>("STOP");
  let timeInterval: NodeJS.Timeout;

  useEffect(() => {
    if (isPresence) {
      const showUpElements = async () => {
        await animate(".buddies__header", { scale: [0, 1], opacity: [0, 1] }, { duration: 0.5, type: "spring" });
        animate(".buddies__button", { scale: [0, 1], opacity: [0, 1] }, { duration: 0.8, type: "spring" });
        await animate(".buddies__input", { scale: [0, 1], opacity: [0, 1] }, { duration: 0.8, type: "spring" });
      };
      const enterAnimation = async () => {
        await animate(scope.current, { scaleY: [0, 1] }, { duration: 0.5 });
        await showUpElements();
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { scale: [1, 0] }, { duration: 0.5, type: "spring" });
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
    const isEveryUserHasQuestion = (data: number) => {
      setAllUsersWrittenQuestion(data);
    };

    const isEveryUserHasAnswer = (data: number) => {
      const temp = data;
      setAllUsersWrittenAnswer(temp);
    };

    const receiveQuestion = (question: string, user: string) => {
      setQuestion({ author: user, question: question });
    };

    const receiveTheBestAnswer = (data: { user: string; answer: string }) => {
      setBestAnswer(data);
      setTime(0);
    };

    const newRound = () => {
      setAllUsersWrittenAnswer(0);
      setWrittenAnswer(false);
    };

    const endGameFunction = () => {
      setEndGame(true);
    };

    socket.on("allQuestionsBuddies", isEveryUserHasQuestion);

    socket.on("allAnswersBuddies", isEveryUserHasAnswer);

    socket.on("receiveQuestionBuddies", receiveQuestion);

    socket.on("receiveTheBestAnswerBuddies", receiveTheBestAnswer);

    socket.on("newRoundBuddies", newRound);

    socket.on("endGameBuddies", endGameFunction);

    return () => {
      socket.off("allQuestionsBuddies", isEveryUserHasQuestion);
      socket.off("allAnswersBuddies", isEveryUserHasAnswer);
      socket.off("receiveQuestionBuddies", receiveQuestion);
      socket.off("newRoundBuddies", newRound);
      socket.off("endGameBuddies", endGameFunction);
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
    const host = users.find((user) => user.id === socket.id)?.is_host;

    const activeUsers = users.filter((user) => !user.is_disconnect);

    if (allUsersWrittenQuestion === activeUsers.length) {
      if (host) {
        socket.emit("getQuestionsBuddies", roomCode);
      }
    }
    if (allUsersWrittenAnswer === activeUsers.length - 1) {
      if (host) {
        socket.emit("getAnswersBuddies", roomCode);
      }
    }
  }, [allUsersWrittenQuestion, allUsersWrittenAnswer]);

  useEffect(() => {
    if (onceDone.current) return;

    const host = users.find((user) => user.id === socket.id)?.is_host;

    if (host) socket.emit("initBestBuddiesAnswers", roomCode);

    onceDone.current = true;
  }, []);

  useEffect(() => {
    if (allUsersWrittenQuestion === users.filter((user) => !user.is_disconnect).length - 1) {
      setWrittenQuestion(true);
    }
  }, []);

  return (
    <div className="buddies" ref={scope}>
      {endGame ? (
        <></>
      ) : !writtenQuestion ? (
        <Question roomCode={roomCode} users={users} onClick={isQuestionWritten} />
      ) : allUsersWrittenQuestion !== users.filter((user) => !user.is_disconnect).length ? (
        <>
          <h3 className="buddies__waiting">Waiting for all players to ask the questions</h3>
          <Hourglass />
        </>
      ) : writtenAnswer || socket.id === question.author ? (
        allUsersWrittenAnswer !== users.filter((user) => !user.is_disconnect).length - 1 ? (
          <>
            <h3 className="buddies__waiting">Waiting for all players to answer</h3>
            <Hourglass />
          </>
        ) : bestAnswer.answer !== "" ? (
          <>
            <BestAnswer bestAnswer={bestAnswer} />
            <ProgressBar width="75%" max={bestAnswerTimeMs} progress={typeof time === "number" ? time : 0} />
          </>
        ) : (
          <AnswersSelect roomCode={roomCode} users={users} question={question} />
        )
      ) : (
        <Answer roomCode={roomCode} users={users} onClick={isAnswerWritten} question={question} />
      )}
    </div>
  );
}
