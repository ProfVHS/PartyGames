import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={75} height={92} viewBox="0 0 75 92" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g filter="url(#filter0_d_1208_14)">
      <path
        d="M12.9903 3H62.9904C62.9904 3 63.5623 31.8551 62.9904 34C61.829 38.3553 55.9465 41.3617 51.2177 43.1171C49.3702 43.803 49.1462 46.8397 50.8804 47.7757C54.3276 49.6362 57.2905 51.6363 59.4228 53.1981C61.7491 54.9021 62.9904 57.6541 62.9904 60.5377V87H12.9903V60.5377C12.9903 57.6541 14.2316 54.9021 16.5579 53.1981C18.7893 51.5637 21.9304 49.4494 25.584 47.5173C27.2801 46.6204 27.1306 43.7914 25.3416 43.0984C20.4143 41.1897 13.9119 37.9674 12.9903 34C11.4806 27.5 12.9903 3 12.9903 3Z"
        fill="#F1EAF7"
      />
    </g>
    <path
      d="M35.8904 68.1831C36.6898 67.099 38.3105 67.099 39.1098 68.1831L48.9756 81.5631C49.9492 82.8835 49.0064 84.75 47.3658 84.75H27.6344C25.9938 84.75 25.0511 82.8835 26.0247 81.5631L35.8904 68.1831Z"
      fill="#FF9E00"
    />
    <rect x={36} y={41} width={3} height={29} fill="#FF9E00" />
    <path
      d="M39.2904 42.4026C38.5545 43.881 36.4452 43.8811 35.7094 42.4026L28.1135 27.1412C27.4518 25.8116 28.4189 24.25 29.904 24.25L45.0957 24.25C46.5809 24.25 47.548 25.8116 46.8862 27.1412L39.2904 42.4026Z"
      fill="#FF9E00"
    />
    <g filter="url(#filter1_d_1208_14)">
      <rect y={84} width={75} height={6} rx={3} fill="#5A189A" />
    </g>
    <g filter="url(#filter2_d_1208_14)">
      <rect width={75} height={6} rx={3} fill="#5A189A" />
    </g>
    <defs>
      <filter
        id="filter0_d_1208_14"
        x={12.3193}
        y={3}
        width={50.9248}
        height={86}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1208_14" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1208_14" result="shape" />
      </filter>
      <filter
        id="filter1_d_1208_14"
        x={0}
        y={84}
        width={75}
        height={8}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1208_14" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1208_14" result="shape" />
      </filter>
      <filter
        id="filter2_d_1208_14"
        x={0}
        y={0}
        width={75}
        height={8}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1208_14" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1208_14" result="shape" />
      </filter>
    </defs>
  </svg>
);
export default SvgComponent;
