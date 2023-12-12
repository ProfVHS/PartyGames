import { SVGProps } from "react";

interface StopwatchPropsSVG {
  props?: SVGProps<SVGSVGElement>;
  strokeOffset: number;
}
export const StopwatchSvg = ({ props, strokeOffset }: StopwatchPropsSVG) => (
  <svg
    width={72}
    height={77}
    viewBox="0 0 72 77"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_403_2289)">
      <circle
        cx={38.1579}
        cy={42.1052}
        r="25px"
        fill="none"
        strokeDasharray={157}
        strokeDashoffset={strokeOffset}
        stroke="#9D4EDD"
        strokeWidth={8}
        strokeLinecap="square"
        className="stopwatch__circle"
      />
    </g>
    <g filter="url(#filter1_d_403_2289)">
      <circle
        cx={38.1579}
        cy={42.1053}
        r={30.8947}
        stroke="#3C096C"
        strokeWidth={4}
      />
      <rect
        x={3.07007}
        y={21.115}
        width={8.77193}
        height={8.77193}
        transform="rotate(-45 3.07007 21.115)"
        fill="#3C096C"
      />
      <rect
        y={21.1461}
        width={13.1579}
        height={6.57895}
        transform="rotate(-45 0 21.1461)"
        fill="#5A189A"
      />
      <rect
        x={33.772}
        y={2.19299}
        width={8.77193}
        height={8.77193}
        fill="#3C096C"
      />
      <rect x={30.2632} width={15.3509} height={6.57895} fill="#5A189A" />
    </g>
    <g filter="url(#filter2_d_403_2289)">
      <circle cx={38.1579} cy={42.1052} r={21.9298} fill="#B87DE8" />
    </g>
    <defs>
      <filter
        id="filter0_d_403_2289"
        x={8.33325}
        y={12.7191}
        width={59.6492}
        height={61.6493}
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
        <feOffset dy={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_403_2289"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_403_2289"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_d_403_2289"
        x={0}
        y={0}
        width={71.0527}
        height={77}
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
        <feOffset dy={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_403_2289"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_403_2289"
          result="shape"
        />
      </filter>
      <filter
        id="filter2_d_403_2289"
        x={13.228}
        y={17.1754}
        width={49.8596}
        height={49.8596}
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
        <feMorphology
          radius={3}
          operator="dilate"
          in="SourceAlpha"
          result="effect1_dropShadow_403_2289"
        />
        <feOffset />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_403_2289"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_403_2289"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
