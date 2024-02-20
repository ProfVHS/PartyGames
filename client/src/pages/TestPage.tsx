import { User } from "../Types";
import { Buddies } from "../components/Buddies/Buddies";
// import { Cards } from "../components/Cards";
// import { Ctb } from "../components/ClickTheBomb/Ctb";
// import { TrickyDiamonds } from "../components/TrickyDiamonds/TrickyDiamonds";

const users: User[] = [
  {
    id: "1",
    username: "User1",
    score: 0,
    id_room: "test",
    id_selected: 0,
    alive: true,
    position: 0,
  },
  {
    id: "2",
    username: "User2",
    score: 0,
    id_room: "test",
    id_selected: 0,
    alive: true,
    position: 0,
  },
  {
    id: "3",
    username: "User3",
    score: 0,
    id_room: "test",
    id_selected: 0,
    alive: true,
    position: 0,
  },
  {
    id: "4",
    username: "User4",
    score: 0,
    id_room: "test",
    id_selected: 0,
    alive: true,
    position: 0,
  },
];

export default function TestPage() {
  return (
    <>
      <Buddies roomCode="test" users={users} />
    </>
  );
}
