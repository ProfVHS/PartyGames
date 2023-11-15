import GameLogo from "../../assets/svgs/logo-whitebg.svg";

function CardBack() {
  return (
    <div className={`card__back`}>
      <img src={GameLogo} draggable={false} style={{ width: "75px" }} />
    </div>
  );
}

export default CardBack;
