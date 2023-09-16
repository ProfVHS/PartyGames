import "../styles/Lobby.scss";

interface LobbyProps {
  roomCode: string;
}

function Lobby({ roomCode }: LobbyProps) {
  return (
    <div className="lobby">
      <span className="lobby__roomcode">Room Code: {roomCode}</span>
      <div className="lobby__playersready">
        <span className="lobby__playersready-count">0</span>
        <span className="lobby__playersready-text">players ready</span>
      </div>
      <button className="lobby__button">Ready</button>
    </div>
  );
}

export default Lobby;
