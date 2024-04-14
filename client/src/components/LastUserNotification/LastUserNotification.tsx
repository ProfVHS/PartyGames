import { useEffect } from "react";
import "./LastUserNotification.scss";
import { socket } from "../../socket";

import { usePresence } from "framer-motion";

interface LastUserNotificationProps{
    onExit?: () => void;
}

export default function LastUserNotification({onExit}: LastUserNotificationProps) {
    const [isPresence, safeToRemove] = usePresence();

    const handleLeaveRoom = () => {
        window.location.href = "/";
    };

    useEffect(() => {
        if(isPresence){

        }
        else{
            onExit && onExit();
        }
    }, [isPresence])

    return (
    <>
        <div id="last-user-dialog" className="last-user-notification">
            <h1>Waiting for other players...</h1>
            <button onClick={handleLeaveRoom}>Leave</button>
        </div>
    </>
  )
}