
interface ButtonProps {
    id: number;
    color: string;
}

export function Button({id, color} : ButtonProps) {
  return (
    <>
        <button className={`memory__button ${color}`}>{id} - {color}</button>
    </>
  )
}
