import { useEffect } from "react";
import "./LastUserNotification.scss";
import { socket } from "../../socket";

import { usePresence } from "framer-motion";
import { Hourglass } from "../Hourglass";

interface LastUserNotificationProps {
  roomCode: string;
  onExit?: () => void;
}

export default function LastUserNotification({ roomCode, onExit }: LastUserNotificationProps) {
  const [isPresence, safeToRemove] = usePresence();

  const handleLeaveRoom = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    if (isPresence) {
    } else {
      console.log("emit updateCurrentGameIndex");

      safeToRemove();
      onExit && onExit();
    }
  }, [isPresence]);

  return (
    <>
      <div id="last-user-dialog" className="last-user-notification">
        <h1>Waiting for other players...</h1>
        <Hourglass />
        <button onClick={handleLeaveRoom}>Leave</button>
      </div>
    </>
  );
}
