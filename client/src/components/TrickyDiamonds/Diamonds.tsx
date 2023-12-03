import { SVGProps, useEffect } from "react";

import { motion, useAnimate } from "framer-motion";

interface DiamondsProps {
  props?: SVGProps<SVGSVGElement>;
  isCracked: boolean;
}

export const BlueDiamond = ({ props, isCracked }: DiamondsProps) => {
  const [scope, animate] = useAnimate();

  const handleCrack = () => {
    animate(
      "#left",
      {
        x: [0, -50],
        y: [0, 50],
        rotate: [0, -20],
        opacity: [1.0, 0.0],
      },
      { duration: 1 }
    );
    animate(
      "#right",
      {
        x: [0, 50],
        y: [0, 50],
        rotate: [0, 15],
        opacity: [1.0, 0.0],
      },
      { duration: 1 }
    );
  };

  useEffect(() => {
    if (isCracked) handleCrack();
    console.log(isCracked);
  }, [isCracked]);

  return (
    <svg
      width={200}
      height={201}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={scope}
    >
      <g id="Diament">
        <motion.g id="left" stroke={"#2DA7FF"}>
          <path
            id="Vector 9"
            d="M100 79.5776H70.8335L100 137.846L104 123.279L95.0001 108.712L104 94.1447L100 79.5776Z"
            fill="#2DA7FF"
          />
          <path
            id="Vector 28"
            d="M70.8333 79.5574H62.5L99.9999 137.826L70.8333 79.5574Z"
            fill="#308ACB"
          />
          <path
            id="Vector 30"
            d="M70.8333 79.5573H62.5L66.6667 71.2241L70.8333 79.5573Z"
            fill="#229FF9"
          />
          <path
            id="Vector 35"
            d="M79.1665 62.8904L66.6665 71.2237L70.8332 79.5775L79.1665 62.8904Z"
            fill="#2DA7FF"
          />
          <path
            id="Vector 33"
            d="M79.1668 62.8582L70.8335 79.5776L100.083 62.8582H79.1668Z"
            fill="#54B6FE"
          />
          <path
            id="Vector 32"
            d="M100 79.5571H70.8335L100 62.8635L94.0001 71.2103L100 79.5571Z"
            fill="#229FF9"
          />
        </motion.g>
        <motion.g id="right" stroke={"#2DA7FF"}>
          <path
            id="Vector 37"
            d="M99.8984 79.6099H129.065L99.8984 137.878L103.898 123.311L94.8984 108.744L103.898 94.1769L99.8984 79.6099Z"
            fill="#2DA7FF"
          />
          <path
            id="Vector 36"
            d="M120.731 62.9226L133.231 71.2559L129.065 79.6097L120.731 62.9226Z"
            fill="#2DA7FF"
          />
          <path
            id="Vector 34"
            d="M120.732 62.8904L129.065 79.6099L99.815 62.8904H120.732Z"
            fill="#54B6FE"
          />
          <path
            id="Vector 31"
            d="M137.398 79.5895H129.065L133.232 71.2563L137.398 79.5895Z"
            fill="#229FF9"
          />
          <path
            id="Vector 38"
            d="M99.8149 79.5839H128.981L99.8149 62.8904L93.8149 71.2371L99.8149 79.5839Z"
            fill="#229FF9"
          />
          <path
            id="Vector 29"
            d="M129.065 79.5896H137.398L99.8985 137.858L129.065 79.5896Z"
            fill="#308ACB"
          />
        </motion.g>
      </g>
    </svg>
  );
};
export const PurpleDiamond = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={76}
    height={76}
    viewBox="0 0 76 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M67.1667 17.2156H8.8335L38.0001 75.4838L67.1667 17.2156Z"
      fill="#CD4AE2"
    />
    <path
      d="M8.83331 17.2156H0.5L37.9999 75.4838L8.83331 17.2156Z"
      fill="#BF30CB"
    />
    <path
      d="M8.83331 17.2155H0.5L4.66666 8.88232L8.83331 17.2155Z"
      fill="#DB22F9"
    />
    <path
      d="M17.1665 0.548584L4.6665 8.8819L8.83316 17.2357L17.1665 0.548584Z"
      fill="#FB2DFF"
    />
    <path
      d="M58.833 0.548584L71.333 8.8819L67.1664 17.2357L58.833 0.548584Z"
      fill="#FB2DFF"
    />
    <path
      d="M17.1668 0.516357L8.8335 17.2358L38.0834 0.516357H17.1668Z"
      fill="#F054FE"
    />
    <path
      d="M58.8332 0.516357L67.1665 17.2358L37.9166 0.516357H58.8332Z"
      fill="#F054FE"
    />
    <path
      d="M75.4998 17.2155H67.1665L71.3332 8.88232L75.4998 17.2155Z"
      fill="#DB22F9"
    />
    <path
      d="M67.1667 17.2153H8.8335L38.0001 0.521729L67.1667 17.2153Z"
      fill="#DB22F9"
    />
    <path
      d="M67.1667 17.2156H75.5L38.0001 75.4838L67.1667 17.2156Z"
      fill="#BF30CB"
    />
  </svg>
);

export const RedDiamond = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={76}
    height={76}
    viewBox="0 0 76 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M67.1667 17.2156H8.8335L38.0001 75.4838L67.1667 17.2156Z"
      fill="#E23F3F"
    />
    <path
      d="M8.83331 17.2156H0.5L37.9999 75.4838L8.83331 17.2156Z"
      fill="#CB3030"
    />
    <path
      d="M8.83331 17.2155H0.5L4.66666 8.88232L8.83331 17.2155Z"
      fill="#F92222"
    />
    <path
      d="M17.1665 0.548584L4.6665 8.8819L8.83316 17.2357L17.1665 0.548584Z"
      fill="#FF2D2D"
    />
    <path
      d="M58.833 0.548584L71.333 8.8819L67.1664 17.2357L58.833 0.548584Z"
      fill="#FF2D2D"
    />
    <path
      d="M17.1668 0.516357L8.8335 17.2358L38.0834 0.516357H17.1668Z"
      fill="#FE5454"
    />
    <path
      d="M58.8332 0.516357L67.1665 17.2358L37.9166 0.516357H58.8332Z"
      fill="#FE5454"
    />
    <path
      d="M75.4998 17.2155H67.1665L71.3332 8.88232L75.4998 17.2155Z"
      fill="#F92222"
    />
    <path
      d="M67.1667 17.2153H8.8335L38.0001 0.521729L67.1667 17.2153Z"
      fill="#E93131"
    />
    <path
      d="M67.1667 17.2156H75.5L38.0001 75.4838L67.1667 17.2156Z"
      fill="#CB3030"
    />
  </svg>
);
