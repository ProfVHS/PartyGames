import { Stopwatch } from "../components/Stopwatch/Stopwatch";
export default function TestPage() {
  return (
    <>
      <Stopwatch size={75} maxTime={15} timeLeft={6} />
    </>
  );
}
