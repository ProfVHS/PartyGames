import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

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
      <button
        className={`colormemory__buttons__item ${color} ${isLight || light ? "light" : ""}`}
        onClick={handleClick}
        disabled={isDisabled}></button>
    </>
  );
}
