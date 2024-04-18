import { BestAnswer } from "../components/Buddies/BestAnswer";

export default function TestPage() {
  return (
    <>
      <div className="buddies">
        <BestAnswer bestAnswer={{ answer: "bardzo dluga odpowiedz zeby rozjebac design XDD", user: "xXusernameXxPL" }} />
      </div>
    </>
  );
}
