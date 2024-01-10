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
}

export function Button({id, color, isLight, isDisabled, roomCode, onClick, currentClickNumber } : ButtonProps) {

    const [light, setLight] = useState<boolean>(isLight);



    const handleClick = () => {
        setLight(true);

        onClick();

        socket.emit("buttonClickedColorsMemory", roomCode, id, currentClickNumber);

        setTimeout(() => {
            setLight(false);
        }, 500);
    };

    return (
        <>
            <button className={`memory__button ${color} ${isLight || light ? "light" : "" }`} onClick={handleClick} disabled={isDisabled}></button>
        </>
    )
}
