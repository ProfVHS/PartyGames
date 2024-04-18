import { BlueDiamond, PurpleDiamond, RedDiamond } from "./Diamonds";
import { Shiny } from "./Shiny";
import { TrickyCardColor } from "../../Types";

import { motion } from "framer-motion";

interface TrickyCard {
  id: number;
  points: number;
  color: TrickyCardColor;
  selectedColor: number | null;
  handleClick: (color: number) => void;
  turnEnded: boolean;
}

export const TrickyCard = ({ id, points, color, selectedColor, handleClick, turnEnded }: TrickyCard) => {
  return (
    <motion.div className={`tricky__cards__item ${id === selectedColor ? "selected" : ""}`} onClick={() => handleClick(id)} initial={{ height: 0 }}>
      <motion.div className="tricky__cards__item__diamond" initial={{ scale: 0 }}>
        {color === "BLUE" && <BlueDiamond isCracked={turnEnded} isFake={false} />}
        {color === "PURPLE" && <PurpleDiamond isCracked={turnEnded} isFake={false} />}
        {color === "RED" && <RedDiamond isCracked={turnEnded} isFake={false} />}
      </motion.div>
      {id === selectedColor && !turnEnded && <Shiny className="tricky__cards__item__shiny" />}
      <motion.span className="tricky__cards__item__value" initial={{ scale: 0 }}>
        +{points} points
      </motion.span>
      {id === selectedColor && <motion.span className="tricky__cards__selected">selected</motion.span>}
    </motion.div>
  );
};
