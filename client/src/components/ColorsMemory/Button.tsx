import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

interface ButtonProps {
    id: number;
    color: string;
    isLight: boolean;
    roomCode: string;
}

export function Button({id, color, isLight, roomCode } : ButtonProps) {

    const [light, setLight] = useState<boolean>(isLight);

    const handleClick = () => {
        setLight(true);

        socket.emit("buttonClickedColorsMemory", roomCode, id );

        setTimeout(() => {
            setLight(false);
        }, 500);
    };

    return (
        <>
            <button className={`memory__button ${color} ${isLight || light ? "light" : "" }`} onClick={handleClick}></button>
        </>
    )
}
