import GameLogo from "../../assets/svgs/logo-whitebg.svg";

function CardBack() {
  return (
    <div className={`card__back`}>
      <img src={GameLogo} draggable={false} />
    </div>
  );
}

export default CardBack;
