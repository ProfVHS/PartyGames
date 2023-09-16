import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();

  const location = useLocation();

  const data = location.state?.username;
  return (
    <div>
      <h2>Lobby</h2>
      <p>Username: {data}</p>
      <p>Kod pokoju: {roomCode}</p>
    </div>
  );
}

export default Lobby;
