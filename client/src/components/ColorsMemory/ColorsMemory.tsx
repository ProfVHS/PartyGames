import { Button } from './Button'
import { User } from '../../Types'
import './style.scss'
import { useEffect, useRef, useState } from 'react';
import { socket } from '../../socket';

const ButtonsColors = ['red', 'orange', 'yellow', 'darkblue', 'blue', 'green', 'purple', 'pink', 'darkgreen'];

interface ColorsMemoryProps {
    roomCode: string;
    users: User[];
}

export function ColorsMemory({ users, roomCode }: ColorsMemoryProps) {
    const round = useRef<number>(1);

    const onceDone = useRef<boolean>(false);

    const [lightButton, setLightButton] = useState<number | null>(null);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [isDead, setIsDead] = useState<boolean>(false);
    const [currentClickNumber, setCurrentClickNumber] = useState<number>(0);
    const [time, setTime] = useState<number>(3);

    const startGamme = () => {
        socket.emit("startGameColorsMemory", roomCode);
    };

    const ButtonsSequence = async (array: number[]) => {
        setIsDisabled(true);
        let x = 0;

        const sequenceInterval = setInterval(() => {
            if (x < array.length) {
                const newNumber: number = array[x];

                setLightButton(newNumber);

                setTimeout(() => {
                    setLightButton(null);
                }, 500);

                x++;
            } else {
                setLightButton(null);
                setCurrentClickNumber(0);
                setIsDisabled(false);

                clearInterval(sequenceInterval);
            }
        }, 1000);
    };

    useEffect(() => {
        if(onceDone.current) return;

        startGamme();

        onceDone.current = true;
    }, []);


    useEffect(() => {
        socket.on("startRoundColorsMemory", () => {
            console.log("startRoundColorsMemory");
        });

        socket.on("sequenceColorsMemory", (data: number[]) => {
            ButtonsSequence(data);
        });

        socket.on("endRoundColorsMemory", () => {
            startGamme();
        });

        socket.on("endGameUserColorsMemory", () => {
            setIsDead(true);
        });

        socket.on("endGameColorsMemory", () => {
            console.log("endGmaeColors");
        });
    }, [socket]); 

    const handleClick = () => {
        const newClicked = currentClickNumber+1;
        setCurrentClickNumber(newClicked);
    }

    return ( 
    <>
        {isDead ? (
            <div>
                <p>Game over</p>
                <p>Score: 1</p>
            </div>
        ) : (
            <>
                <div className="memory__buttons">
                    {ButtonsColors.map((color, index) => (
                        <Button
                            key={index}
                            id={index}
                            color={color}
                            isLight={lightButton === index}
                            isDisabled={isDisabled}
                            roomCode={roomCode}
                            onClick={handleClick}
                            currentClickNumber={currentClickNumber}
                        />
                    ))}
                </div>
            </>
        )}
        <div>
            <p>Round: {round.current}</p>
            <p>Score: 1</p>
            <p>Current: {currentClickNumber}</p>
            <p>Time - {time}</p>
        </div>
    </>
  )
}
