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

    const ButtonsSequence = (array: number[]) => {
        let x = 0;

        const myInterval = setInterval(() => {
            if (x < array.length) {
                const newNumber: number = array[x];

                setLightButton(newNumber);

                setTimeout(() => {
                    setLightButton(null);
                }, 1000);

                x++;
            } else {
                setLightButton(null);
                clearInterval(myInterval);
            }
        }, 1500);
    };

    useEffect(() => {
        console.log(lightButton);
    }, [lightButton]);

    useEffect(() => {
        if(onceDone.current) return;

        socket.emit("startGameColorsMemory", roomCode);

        onceDone.current = true;
    }, []);

    useEffect(() => {
        socket.on("startRoundColorsMemory", () => {
            console.log("startRoundColorsMemory");
        });

        socket.on("endRoundColorsMemory", (data: number[]) => {
            ButtonsSequence(data);
        });

        socket.on("endGameColorsMemory", () => {
            console.log("endGmaeColors");
        });
    }, [socket]); 

    return ( 
    <>
        <div className='colors__memory'> 
            {ButtonsColors.map((color,index) => 
                <Button 
                key={index} 
                id={index} 
                color={color} 
                isLight={index == lightButton ? true : false}
                roomCode={roomCode}
            />)}
        </div>
        <div>
            <p>Round: {round.current}</p>
            <p>Score: 1</p>
            <p>Alive: 1</p>
        </div>
    </>
  )
}
