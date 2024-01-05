import { useEffect, useRef, useState } from "react";

interface ButtonProps {
    id: number;
    color: string;
    isLight: boolean;
}

export function Button({id, color, isLight } : ButtonProps) {

    const [light, setLight] = useState<boolean>(isLight);

    const handleClick = () => {
        setLight(true);

        setTimeout(() => {
            setLight(false);
        }, 500);
    };

    return (
        <>
            <button className={`memory__button ${light ? "white" : color}`} onClick={handleClick}>{id} - {color}</button>
        </>
    )
}
