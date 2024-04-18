import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useAnimate, usePresence, motion } from "framer-motion";

interface ButtonProps {
  id: number;
  color: string;
  isLight: boolean;
  isDisabled: boolean;
  roomCode: string;
  onClick: () => void;
  currentClickNumber: number;
  audio: HTMLAudioElement;
}

export function Button({ id, color, isLight, isDisabled, roomCode, onClick, currentClickNumber, audio }: ButtonProps) {
  const [light, setLight] = useState<boolean>(isLight);
  const [scope, animate] = useAnimate();
  const [isPresence, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresence) {
      const enterAnimation = async () => {
        await animate(scope.current, { opacity: [0, 1], y: [200, 0] }, { duration: 1, type: "spring", delay: id * 0.1 });
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { opacity: [1, 0], y: [0, 200] }, { duration: 1, type: "spring" });
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresence]);

  const handleClick = () => {
    setLight(true);

    onClick();
    new Audio(audio.src).play();

    socket.emit("buttonClickedColorsMemory", roomCode, id, currentClickNumber);

    setTimeout(() => {
      setLight(false);
    }, 500);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        ref={scope}
        className={`colormemory__buttons__item ${color} ${isLight || light ? "light" : ""}`}
        onClick={handleClick}
        disabled={isDisabled}></motion.button>
    </>
  );
}
