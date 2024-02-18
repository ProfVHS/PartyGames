import { SVGProps } from "react";
import { motion } from "framer-motion";

export const Hourglass = (props: SVGProps<SVGSVGElement>) => (
  <svg width={80} height={60} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <motion.g
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}>
      <g filter="url(#filter0_d_1208_31)">
        <path
          d="M28.4957 9.93311H51.8291C51.8291 9.93311 52.096 23.3988 51.8291 24.3998C51.2871 26.4322 48.542 27.8352 46.3352 28.6544C45.473 28.9745 45.3685 30.3916 46.1778 30.8284C47.7865 31.6967 49.1692 32.63 50.1642 33.3589C51.2498 34.1541 51.8291 35.4384 51.8291 36.784V49.1331H28.4957V36.784C28.4957 35.4384 29.075 34.1541 30.1606 33.3589C31.2019 32.5962 32.6678 31.6095 34.3728 30.7078C35.1643 30.2893 35.0945 28.9691 34.2597 28.6457C31.9603 27.755 28.9258 26.2512 28.4957 24.3998C27.7912 21.3664 28.4957 9.93311 28.4957 9.93311Z"
          fill="#F1EAF7"
        />
      </g>
      <path
        d="M39.1823 40.3521C39.5554 39.8462 40.3117 39.8462 40.6847 40.3521L45.2888 46.5961C45.7431 47.2123 45.3031 48.0833 44.5375 48.0833H35.3295C34.5639 48.0833 34.124 47.2123 34.5783 46.5961L39.1823 40.3521Z"
        fill="#FF9E00"
      />
      <path d="M40.6334 27.6665H39.2334V41.1998H40.6334V27.6665Z" fill="#FF9E00" />
      <path
        d="M40.7689 28.3213C40.4255 29.0112 39.4412 29.0113 39.0978 28.3213L35.5531 21.1993C35.2443 20.5788 35.6956 19.8501 36.3886 19.8501H43.4781C44.1712 19.8501 44.6225 20.5788 44.3137 21.1993L40.7689 28.3213Z"
        fill="#FF9E00"
      />
      <g filter="url(#filter1_d_1208_31)">
        <path
          d="M56.1654 48.6665H23.9654C23.1922 48.6665 22.5654 49.2933 22.5654 50.0665C22.5654 50.8397 23.1922 51.4665 23.9654 51.4665H56.1654C56.9386 51.4665 57.5654 50.8397 57.5654 50.0665C57.5654 49.2933 56.9386 48.6665 56.1654 48.6665Z"
          fill="#5A189A"
        />
      </g>
      <g filter="url(#filter2_d_1208_31)">
        <path
          d="M56.0336 8.5332H23.8336C23.0604 8.5332 22.4336 9.16 22.4336 9.9332C22.4336 10.7064 23.0604 11.3332 23.8336 11.3332H56.0336C56.8068 11.3332 57.4336 10.7064 57.4336 9.9332C57.4336 9.16 56.8068 8.5332 56.0336 8.5332Z"
          fill="#5A189A"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1208_31"
          x={28.1826}
          y={9.93311}
          width={23.7646}
          height={41.2002}
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1208_31" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1208_31" result="shape" />
        </filter>
        <filter
          id="filter1_d_1208_31"
          x={22.5654}
          y={48.6665}
          width={35}
          height={4.7998}
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1208_31" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1208_31" result="shape" />
        </filter>
        <filter
          id="filter2_d_1208_31"
          x={22.4336}
          y={8.5332}
          width={35}
          height={4.7998}
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1208_31" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1208_31" result="shape" />
        </filter>
      </defs>
    </motion.g>
  </svg>
);
