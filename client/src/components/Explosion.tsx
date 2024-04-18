import { SVGProps } from "react";
import { motion } from "framer-motion";

const rects = [
  { x: -125, y: -100, color: "#F8B13D", size: 25 },
  { x: 175, y: 100, color: "#FF9E00", size: 35 },
  { x: -100, y: 150, color: "#F8B13D", size: 33 },
  { x: 150, y: -125, color: "#FF9E00", size: 20 },
  { x: -125, y: -125, color: "#F8B13D", size: 20 },
  { x: 125, y: 75, color: "#FF9E00", size: 40 },
  { x: -150, y: 125, color: "#F8B13D", size: 45 },
  { x: 50, y: -150, color: "#FF9E00", size: 20 },
  { x: -25, y: -75, color: "#F8B13D", size: 40 },
  { x: 35, y: 75, color: "#FF9E00", size: 20 },
  { x: -50, y: 75, color: "#F8B13D", size: 20 },
  { x: 45, y: -75, color: "#FF9E00", size: 33 },
  { x: -30, y: -170, color: "#F8B13D", size: 30 },
  { x: 40, y: 160, color: "#FF9E00", size: 40 },
  { x: -55, y: 175, color: "#F8B13D", size: 25 },
  { x: 50, y: -165, color: "#FF9E00", size: 30 },
  { x: 125, y: 0, color: "#F8B13D", size: 20 },
  { x: -125, y: 0, color: "#FF9E00", size: 25 },

  { x: -80, y: -20, color: "#F5890B", size: 15 },
  { x: 100, y: 20, color: "#F5890B", size: 15 },
  { x: -40, y: 120, color: "#F5890B", size: 15 },
  { x: 120, y: -115, color: "#F5890B", size: 15 },
  { x: -80, y: -115, color: "#F5890B", size: 15 },

  { x: 80, y: 25, color: "#F5890B", size: 15 },
  { x: -115, y: 115, color: "#F5890B", size: 15 },
  { x: 15, y: -120, color: "#F5890B", size: 15 },
  { x: -10, y: -25, color: "#F5890B", size: 15 },
];

const Explosion = (props: SVGProps<SVGSVGElement>) => (
  <svg
    // width={500}
    // height={500}
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="rects">
      {rects.map((rect, index) => (
        <motion.rect
          key={index}
          id="rect"
          height={rect.size}
          width={rect.size}
          x={240}
          y={250}
          fill={rect.color}
          animate={{
            y: [0, rect.y],
            x: [0, rect.x],
            opacity: [1.0, 0.8, 0.0],
          }}
          transition={{
            duration: 1,
          }}
        />
      ))}
    </g>
  </svg>
);
export default Explosion;
