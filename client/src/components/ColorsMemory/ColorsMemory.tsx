import { Button } from './Button'
import { User } from '../../Types'
import './style.scss'
import { useEffect, useRef } from 'react';
import { socket } from '../../socket';

const ButtonsColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'grey'];

interface ColorsMemoryProps {
    roomCode: string;
    users: User[];
}

export default function ColorsMemory({ users, roomCode }: ColorsMemoryProps) {
    const round = useRef<number>(1);

    const onceDone = useRef<boolean>(false);

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
            console.log("endRoundColorsMemory");
            var x = 0;

            const myInterval = setInterval(() => {
                if(x < data.length){
                    console.log(data[x]);
                    x++;
                } else {
                    clearInterval(myInterval);
                }
            }, 1000);

            round.current++;
        });

        socket.on("endGameColorsMemory", () => {
            console.log("endGameColorsMemory");
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
