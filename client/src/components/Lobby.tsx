import "../styles/Lobby.scss";

interface LobbyProps {
  roomCode: string | undefined
  onClick: () => void
  players: number | undefined
}

function Lobby({ roomCode, onClick, players }: LobbyProps) {
  
  return (
    <div className="lobby">
      <span className="lobby__roomcode">Room Code: {roomCode}</span>
      <div className="lobby__playersready">
        <span className="lobby__playersready-count">{players}</span>
        <span className="lobby__playersready-text">players ready</span>
      </div>
      <button className="lobby__button" onClick={onClick}>
        Ready
      </button>
    </div>
  );
}

export default Lobby;
