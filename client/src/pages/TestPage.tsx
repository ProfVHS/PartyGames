import { useEffect, useRef } from "react";
import { socket } from "../socket";

export default function TestPage() {
  const onceDone = useRef<boolean>(false);
  useEffect(() => {
    if (onceDone.current) return;
    socket.emit("exampleUserAdd", "xxxxxx");
    onceDone.current = true;
  }, []);

  const handleCheck = () => {
    socket.emit("getMedals", "xxxxxx");
  };
  return (
    <>
      <h1>Test</h1>
      <button onClick={handleCheck}>Test</button>
    </>
  );
}
