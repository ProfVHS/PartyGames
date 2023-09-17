import "../styles/Lobby.scss";

import ClickSound from "../assets/audio/click.mp3";

interface LobbyProps {
  roomCode: string;
}

function Lobby({ roomCode }: LobbyProps) {
  const handleReadyClick = () => {
    new Audio(ClickSound).play();
  };
  return (
    <div className="lobby">
      <span className="lobby__roomcode">Room Code: {roomCode}</span>
      <div className="lobby__playersready">
        <span className="lobby__playersready-count">0</span>
        <span className="lobby__playersready-text">players ready</span>
      </div>
      <button className="lobby__button" onClick={handleReadyClick}>
        Ready
      </button>
    </div>
  );
}

export default Lobby;
