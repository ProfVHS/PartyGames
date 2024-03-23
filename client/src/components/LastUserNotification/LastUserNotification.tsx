import "./LastUserNotification.scss";

interface LastUserNotificationProps {
    isOpen: boolean;
}

export default function LastUserNotification({ isOpen }: LastUserNotificationProps) {
    const handleLeaveRoom = () => {
        window.location.href = "/";
    };

    if (isOpen){
        let dialog: any = document.getElementById("last-user-dialog");
        dialog?.showModal();
    };

    return (
    <>
        <dialog id="last-user-dialog" className="last-user-notification">
            <h1>Waiting for other players...</h1>
            <button onClick={handleLeaveRoom}>Leave</button>
        </dialog>
    </>
  )
}
