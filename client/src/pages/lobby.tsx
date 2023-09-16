import { useParams } from 'react-router-dom';

function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();

  return (
    <div>
      <h2>Lobby</h2>
      <p>Username: </p>
      <p>Kod pokoju: {roomCode}</p>
    </div>
  );
}

export default Lobby;
