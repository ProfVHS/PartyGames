import { SVGProps } from "react";
const MineSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={99}
    height={104}
    viewBox="0 0 99 104"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_369_151)">
      <circle cx={49.5} cy={50} r={37.5} fill="black" />
      <rect x={43} width={12.5} height={15} rx={5} fill="black" />
      <rect
        y={56.5}
        width={12.5}
        height={15}
        rx={5}
        transform="rotate(-90 0 56.5)"
        fill="black"
      />
      <rect
        x={83.5}
        y={56.5}
        width={12.5}
        height={15}
        rx={5}
        transform="rotate(-90 83.5 56.5)"
        fill="black"
      />
      <rect
        x={9.5}
        y={19.3389}
        width={12.5}
        height={15}
        rx={5}
        transform="rotate(-45 9.5 19.3389)"
        fill="black"
      />
      <rect
        x={18.1064}
        y={68}
        width={12.5}
        height={15}
        rx={5}
        transform="rotate(45 18.1064 68)"
        fill="black"
      />
      <rect
        x={81.1064}
        y={10.5}
        width={12.5}
        height={15}
        rx={5}
        transform="rotate(45 81.1064 10.5)"
        fill="black"
      />
      <rect
        x={70.5}
        y={79.3389}
        width={12.5}
        height={15}
        rx={5}
        transform="rotate(-45 70.5 79.3389)"
        fill="black"
      />
      <rect x={43} y={85} width={12.5} height={15} rx={5} fill="black" />
      <path
        d="M23.9812 38.0427C23.7332 37.845 23.5945 37.5438 23.6438 37.2305C23.8773 35.7487 25.0526 31.2108 30.8864 27.0505C36.6054 22.9721 41.209 23.2445 42.7795 23.5036C43.1416 23.5634 43.4053 23.8516 43.4785 24.2112L43.9602 26.577C44.1 27.2636 43.4998 27.9433 42.8033 28.0202C41.1544 28.2023 38.1715 28.9615 34.2457 31.7611C30.2047 34.6429 28.2406 37.3944 27.367 38.9481C27.0249 39.5566 26.1678 39.786 25.6219 39.3508L23.9812 38.0427Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_369_151"
        x={0}
        y={0}
        width={98.5}
        height={104}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={4} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_369_151"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_369_151"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default MineSvg;
