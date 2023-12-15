import { SVGProps } from "react";
import { motion } from "framer-motion";
export const Shiny = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={25}
    height={25}
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.path
      d="M10.75 11L12.5 0L14 11L25 12.5L14 14L12.5 25L10.75 14L0 12.5L10.75 11Z"
      fill="white"
      animate={{ rotate: [0, 180], scale: [0, 1.0, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop" }}
    />
  </svg>
);
