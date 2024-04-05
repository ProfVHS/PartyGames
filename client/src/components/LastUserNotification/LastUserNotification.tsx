import "./LastUserNotification.scss";

export default function LastUserNotification() {
    const handleLeaveRoom = () => {
        window.location.href = "/";
    };

    return (
    <>
        <div id="last-user-dialog" className="last-user-notification">
            <h1>Waiting for other players...</h1>
            <button onClick={handleLeaveRoom}>Leave</button>
        </div>
    </>
  )
}
