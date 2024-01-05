import { Button } from './Button'
import { User } from '../../Types'
import './style.scss'
import { useEffect, useRef, useState } from 'react';
import { socket } from '../../socket';

const ButtonsColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'grey'];

interface ColorsMemoryProps {
    roomCode: string;
    users: User[];
}

export function ColorsMemory({ users, roomCode }: ColorsMemoryProps) {
    const round = useRef<number>(1);

    const onceDone = useRef<boolean>(false);

    const [lightButton, setLightButton] = useState<number | null>(null);

    const ButtonsSequentions = (array: number[]) => {
        let x = 0;

        const myInterval = setInterval(() => {
            if (x < array.length) {
                const newNumber: number = array[x];

                setLightButton(newNumber);

                x++;
            } else {
                setLightButton(null);
                clearInterval(myInterval);
            }
        }, 1000);
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
            ButtonsSequentions(data);
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
                color={index == lightButton ? 'white' : color} 
                isLight={false}
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
