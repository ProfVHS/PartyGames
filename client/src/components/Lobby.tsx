import "../styles/Lobby.scss";

interface LobbyProps {
  roomCode: string | undefined;
  onClick: () => void;
  players: number | undefined;
  isReady: boolean;
}

function Lobby({ roomCode, onClick, players, isReady }: LobbyProps) {
  return (
    <div className="lobby">
      <span className="lobby__roomcode">Room Code: {roomCode}</span>
      <div className="lobby__playersready">
        <span className="lobby__playersready-count">{players}</span>
        <span className="lobby__playersready-text">players ready</span>
      </div>
      <button className="lobby__button" onClick={onClick}>
        {isReady ? "Unready" : "Ready"}
      </button>
    </div>
  );
}

export default Lobby;
