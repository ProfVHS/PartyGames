import "./Notification.scss";
interface NotificationProps {
  textContent: string;
}

export default function Notification({ textContent }: NotificationProps) {
  const handleLeaveRoom = () => {
    window.location.href = "/";
  };

  return (
    <>
      <div id="notification" className="notification">
        <h1>{textContent}</h1>
        <button onClick={handleLeaveRoom}>Leave</button>
      </div>
    </>
  );
}
