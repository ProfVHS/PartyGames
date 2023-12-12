import { SVGProps, useEffect } from "react";

import { motion, useAnimate } from "framer-motion";

interface DiamondsProps {
  props?: SVGProps<SVGSVGElement>;
  isCracked: boolean;
  isFake: boolean;
}

export const BlueDiamond = ({ props, isCracked, isFake }: DiamondsProps) => {
  const [scope, animate] = useAnimate();

  const breakAnimation = () => {
    animate(
      "#left",
      {
        x: [0, -15],
        y: [0, 5],
        rotate: [0, -10],
      },
      { duration: 0.3, ease: "linear" }
    );
    animate(
      "#right",
      {
        x: [0, 15],
        y: [0, 5],
        rotate: [0, 10],
      },
      { duration: 0.3, ease: "linear" }
    );
  };

  const shakeAnimation = async () => {
    await animate(
      "#diamond",
      { x: [0, -1, 0, 1, 0], y: [0, 1, 0, 1, 0, -1, 0, -1, 0] },
      { duration: 0.3, repeat: 4 }
    );
  };

  const crackingAnimation = async () => {
    await shakeAnimation();
    if (isFake) await breakAnimation();
  };

  useEffect(() => {
    if (isCracked) crackingAnimation();
    console.log(isCracked);
  }, [isCracked]);

  return (
    <svg
      width={200}
      height={201}
      viewBox="0 0 200 201"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={scope}
    >
      <motion.g id="diamond">
        <motion.g id="left" x={-10}>
          <path
            id="Vector 9_2"
            d="M100 77.5H70.5L100 136L98.5 121.5L103.5 107L98.5 92.5L103.5 85.25L100.5 78Z"
            fill="#2DA7FF"
          />
          <path id="Vector 28_2" d="M71 78H63L100 136L71 78Z" fill="#308ACB" />
          <path id="Vector 35_2" d="M80 62L67 70L71 78L80 62Z" fill="#2DA7FF" />
          <path id="Vector 30_2" d="M71 78H63L67 70L71 78Z" fill="#229FF9" />
          <path
            id="Vector 33_2"
            d="M80 62L71 78L100 61L80 62Z"
            fill="#54B6FE"
          />
          <path
            id="Vector 32_2"
            d="M100 78H71L100 61L96.5 69.5L100.5 78Z"
            fill="#229FF9"
          />
        </motion.g>
        <motion.g id="right">
          <path
            id="Vector 9"
            d="M100 77.5H129.5L100 136L98 121.5L103 107L98 92.5L103 85.25L100 78Z"
            fill="#2DA7FF"
          />
          <path id="Vector 28" d="M129 78H137L100 136L129 78Z" fill="#308ACB" />
          <path
            id="Vector 35"
            d="M120 62L133 70L129 78L120 62Z"
            fill="#2DA7FF"
          />
          <path id="Vector 30" d="M129 78H137L133 70L129 78Z" fill="#229FF9" />
          <path
            id="Vector 33"
            d="M120 62L129 78L100 61L120 62Z"
            fill="#54B6FE"
          />
          <path
            id="Vector 32"
            d="M100 78H129L100 61L96 69.5L100 78Z"
            fill="#229FF9"
          />
          <path
            id="crack"
            d="M100 61H101L97 69.5L101 78L104 85.25L99 92.5L104 107L99 121.5L101 136H100L98 121.5L103 107L98 92.5L103 85.25L100 78L96 69.5L100 61Z"
            fill="black"
            opacity={0}
          />
        </motion.g>
      </motion.g>
    </svg>
  );
};
export const PurpleDiamond = ({ props, isCracked, isFake }: DiamondsProps) => {
  const [scope, animate] = useAnimate();

  const breakAnimation = () => {
    animate(
      "#left",
      {
        x: [0, -15],
        y: [0, 5],
        rotate: [0, -10],
      },
      { duration: 0.3, ease: "linear" }
    );
    animate(
      "#right",
      {
        x: [0, 15],
        y: [0, 5],
        rotate: [0, 10],
      },
      { duration: 0.3, ease: "linear" }
    );
  };

  const shakeAnimation = async () => {
    await animate(
      "#diamond",
      { x: [0, -1, 0, 1, 0], y: [0, 1, 0, 1, 0, -1, 0, -1, 0] },
      { duration: 0.3, repeat: 4 }
    );
  };

  const crackingAnimation = async () => {
    await shakeAnimation();
    if (isFake) await breakAnimation();
  };

  useEffect(() => {
    if (isCracked) crackingAnimation();
    console.log(isCracked);
  }, [isCracked]);

  return (
    <svg
      width={200}
      height={201}
      viewBox="0 0 200 201"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={scope}
    >
      <motion.g id="diamond">
        <motion.g id="left" x={-10}>
          <path
            id="Vector 9_2"
            d="M100 77.5H70.5L100 136L98.5 121.5L103.5 107L98.5 92.5L103.5 85.25L100.5 78Z"
            fill="#CD4AE2"
          />
          <path id="Vector 28_2" d="M71 78H63L100 136L71 78Z" fill="#BF30CB" />
          <path id="Vector 35_2" d="M80 62L67 70L71 78L80 62Z" fill="#FB2DFF" />
          <path id="Vector 30_2" d="M71 78H63L67 70L71 78Z" fill="#DB22F9" />
          <path
            id="Vector 33_2"
            d="M80 62L71 78L100 61L80 62Z"
            fill="#F054FE"
          />
          <path
            id="Vector 32_2"
            d="M100 78H71L100 61L96.5 69.5L100.5 78Z"
            fill="#DB22F9"
          />
        </motion.g>
        <motion.g id="right">
          <path
            id="Vector 9"
            d="M100 77.5H129.5L100 136L98 121.5L103 107L98 92.5L103 85.25L100 78Z"
            fill="#CD4AE2"
          />
          <path id="Vector 28" d="M129 78H137L100 136L129 78Z" fill="#BF30CB" />
          <path
            id="Vector 35"
            d="M120 62L133 70L129 78L120 62Z"
            fill="#FB2DFF"
          />
          <path id="Vector 30" d="M129 78H137L133 70L129 78Z" fill="#DB22F9" />
          <path
            id="Vector 33"
            d="M120 62L129 78L100 61L120 62Z"
            fill="#F054FE"
          />
          <path
            id="Vector 32"
            d="M100 78H129L100 61L96 69.5L100 78Z"
            fill="#DB22F9"
          />
        </motion.g>
      </motion.g>
    </svg>
  );
};

export const RedDiamond = ({ props, isCracked, isFake }: DiamondsProps) => {
  const [scope, animate] = useAnimate();

  const breakAnimation = () => {
    animate(
      "#left",
      {
        x: [0, -15],
        y: [0, 5],
        rotate: [0, -10],
      },
      { duration: 0.3, ease: "linear" }
    );
    animate(
      "#right",
      {
        x: [0, 15],
        y: [0, 5],
        rotate: [0, 10],
      },
      { duration: 0.3, ease: "linear" }
    );
  };

  const shakeAnimation = async () => {
    await animate(
      "#diamond",
      { x: [0, -1, 0, 1, 0], y: [0, 1, 0, 1, 0, -1, 0, -1, 0] },
      { duration: 0.3, repeat: 4 }
    );
  };

  const crackingAnimation = async () => {
    await shakeAnimation();
    if (isFake) await breakAnimation();
  };

  useEffect(() => {
    if (isCracked) crackingAnimation();
    console.log(isCracked);
  }, [isCracked]);

  return (
    <svg
      width={200}
      height={201}
      viewBox="0 0 200 201"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={scope}
    >
      <motion.g id="diamond">
        <motion.g id="left" x={-10}>
          <path
            id="Vector 9_2"
            d="M100 77.5H70.5L100 136L98.5 121.5L103.5 107L98.5 92.5L103.5 85.25L100.5 78Z"
            fill="#E23F3F"
          />
          <path id="Vector 28_2" d="M71 78H63L100 136L71 78Z" fill="#CB3030" />
          <path id="Vector 35_2" d="M80 62L67 70L71 78L80 62Z" fill="#FF2D2D" />
          <path id="Vector 30_2" d="M71 78H63L67 70L71 78Z" fill="#F92222" />
          <path
            id="Vector 33_2"
            d="M80 62L71 78L100 61L80 62Z"
            fill="#FE5454"
          />
          <path
            id="Vector 32_2"
            d="M100 78H71L100 61L96.5 69.5L100.5 78Z"
            fill="#E93131"
          />
        </motion.g>
        <motion.g id="right">
          <path
            id="Vector 9"
            d="M100 77.5H129.5L100 136L98 121.5L103 107L98 92.5L103 85.25L100 78Z"
            fill="#E23F3F"
          />
          <path id="Vector 28" d="M129 78H137L100 136L129 78Z" fill="#CB3030" />
          <path
            id="Vector 35"
            d="M120 62L133 70L129 78L120 62Z"
            fill="#FF2D2D"
          />
          <path id="Vector 30" d="M129 78H137L133 70L129 78Z" fill="#F92222" />
          <path
            id="Vector 33"
            d="M120 62L129 78L100 61L120 62Z"
            fill="#FE5454"
          />
          <path
            id="Vector 32"
            d="M100 78H129L100 61L96 69.5L100 78Z"
            fill="#E93131"
          />
        </motion.g>
      </motion.g>
    </svg>
  );
};
