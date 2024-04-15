import { SVGProps } from "react";

export const SkullSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg width={50} height={53} viewBox="0 0 50 53" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M15 35C13.6739 35 12.4021 34.4732 11.4645 33.5355C10.5268 32.5979 10 31.3261 10 30C10 28.6739 10.5268 27.4021 11.4645 26.4645C12.4021 25.5268 13.6739 25 15 25C16.3261 25 17.5979 25.5268 18.5355 26.4645C19.4732 27.4021 20 28.6739 20 30C20 31.3261 19.4732 32.5979 18.5355 33.5355C17.5979 34.4732 16.3261 35 15 35ZM21.25 40L25 32.5L28.75 40H21.25ZM35 35C33.6739 35 32.4021 34.4732 31.4645 33.5355C30.5268 32.5979 30 31.3261 30 30C30 28.6739 30.5268 27.4021 31.4645 26.4645C32.4021 25.5268 33.6739 25 35 25C36.3261 25 37.5979 25.5268 38.5355 26.4645C39.4732 27.4021 40 28.6739 40 30C40 31.3261 39.4732 32.5979 38.5355 33.5355C37.5979 34.4732 36.3261 35 35 35ZM50 25C50 18.3696 47.3661 12.0107 42.6777 7.32233C37.9893 2.63392 31.6304 0 25 0C21.717 0 18.4661 0.646644 15.4329 1.90301C12.3998 3.15938 9.6438 5.00087 7.32233 7.32233C2.63392 12.0107 0 18.3696 0 25C0 32 3 38.25 7.5 42.75V52.5H42.5V42.75C47 38.25 50 32 50 25ZM37.5 47.5H32.5V42.5H27.5V47.5H22.5V42.5H17.5V47.5H12.5V40.5C8 36.75 5 31.25 5 25C5 19.6957 7.10714 14.6086 10.8579 10.8579C14.6086 7.10714 19.6957 5 25 5C30.3043 5 35.3914 7.10714 39.1421 10.8579C42.8929 14.6086 45 19.6957 45 25C45 31.25 42 37 37.5 40.5V47.5Z"
      fill="#B87DE8"
    />
  </svg>
);

export const TouchSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg width={50} height={64} viewBox="0 0 50 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M44 28C44.8333 28 45.6146 28.1562 46.3438 28.4688C47.0729 28.7812 47.7083 29.2083 48.25 29.75C48.7917 30.2917 49.2188 30.9271 49.5312 31.6562C49.8438 32.3854 50 33.1667 50 34V46C50 48.4792 49.5312 50.8125 48.5938 53C47.6562 55.1875 46.3646 57.0938 44.7188 58.7188C43.0729 60.3438 41.1667 61.625 39 62.5625C36.8333 63.5 34.5 63.9792 32 64C29 64 26.2083 63.4271 23.625 62.2812C21.0417 61.1354 18.6875 59.5104 16.5625 57.4062L1.8125 42.6562C1.22917 42.0729 0.78125 41.3958 0.46875 40.625C0.15625 39.8542 0 39.0625 0 38.25C0 37.375 0.166667 36.5625 0.5 35.8125C0.833333 35.0625 1.28125 34.3958 1.84375 33.8125C2.40625 33.2292 3.0625 32.7917 3.8125 32.5C4.5625 32.2083 5.375 32.0417 6.25 32C7.95833 32 9.42708 32.6146 10.6562 33.8438L14 37.1562V26.6562C12.7708 26.0729 11.6667 25.3438 10.6875 24.4688C9.70833 23.5938 8.875 22.6042 8.1875 21.5C7.5 20.3958 6.95833 19.2083 6.5625 17.9375C6.16667 16.6667 5.97917 15.3542 6 14C6 12.0625 6.36458 10.25 7.09375 8.5625C7.82292 6.875 8.82292 5.38542 10.0938 4.09375C11.3646 2.80208 12.8438 1.80208 14.5312 1.09375C16.2188 0.385417 18.0417 0.0208333 20 0C21.9375 0 23.75 0.364583 25.4375 1.09375C27.125 1.82292 28.6146 2.82292 29.9062 4.09375C31.1979 5.36458 32.1979 6.84375 32.9062 8.53125C33.6146 10.2188 33.9792 12.0417 34 14C34 15.9375 33.6146 17.7917 32.8438 19.5625C32.0729 21.3333 30.9792 22.8854 29.5625 24.2188C30.2917 24.4062 30.9479 24.7188 31.5312 25.1562C32.1146 25.5938 32.625 26.1354 33.0625 26.7812C34 26.2604 34.9792 26 36 26C37.0417 26 38.0104 26.2396 38.9062 26.7188C39.8021 27.1979 40.5208 27.8854 41.0625 28.7812C42 28.2604 42.9792 28 44 28ZM10 14C10 15.5625 10.3542 17.0521 11.0625 18.4688C11.7708 19.8854 12.75 21.0625 14 22V14C14 13.1667 14.1562 12.3854 14.4688 11.6562C14.7812 10.9271 15.2083 10.2917 15.75 9.75C16.2917 9.20833 16.9271 8.78125 17.6562 8.46875C18.3854 8.15625 19.1667 8 20 8C20.8333 8 21.6146 8.15625 22.3438 8.46875C23.0729 8.78125 23.7083 9.20833 24.25 9.75C24.7917 10.2917 25.2188 10.9271 25.5312 11.6562C25.8438 12.3854 26 13.1667 26 14V22C27.25 21.0625 28.2292 19.8854 28.9375 18.4688C29.6458 17.0521 30 15.5625 30 14C30 12.625 29.7396 11.3333 29.2188 10.125C28.6979 8.91667 27.9792 7.86458 27.0625 6.96875C26.1458 6.07292 25.0833 5.35417 23.875 4.8125C22.6667 4.27083 21.375 4 20 4C18.625 4 17.3333 4.26042 16.125 4.78125C14.9167 5.30208 13.8542 6.02083 12.9375 6.9375C12.0208 7.85417 11.3021 8.91667 10.7812 10.125C10.2604 11.3333 10 12.625 10 14ZM46 34C46 33.4583 45.8021 32.9896 45.4062 32.5938C45.0104 32.1979 44.5417 32 44 32C43.2917 32 42.8021 32.1979 42.5312 32.5938C42.2604 32.9896 42.0938 33.4792 42.0312 34.0625C41.9688 34.6458 41.9583 35.2917 42 36C42.0417 36.7083 42.0417 37.3438 42 37.9062C41.9583 38.4688 41.7917 38.9688 41.5 39.4062C41.2083 39.8438 40.7083 40.0417 40 40C39.2292 40 38.7083 39.7604 38.4375 39.2812C38.1667 38.8021 38 38.1771 37.9375 37.4062C37.875 36.6354 37.8958 35.8333 38 35C38.1042 34.1667 38.125 33.3646 38.0625 32.5938C38 31.8229 37.8438 31.2083 37.5938 30.75C37.3438 30.2917 36.8125 30.0417 36 30C35.2917 30 34.8021 30.1979 34.5312 30.5938C34.2604 30.9896 34.0938 31.4792 34.0312 32.0625C33.9688 32.6458 33.9583 33.2917 34 34C34.0417 34.7083 34.0417 35.3438 34 35.9062C33.9583 36.4688 33.7917 36.9688 33.5 37.4062C33.2083 37.8438 32.7083 38.0417 32 38C31.2292 38 30.7083 37.7604 30.4375 37.2812C30.1667 36.8021 30 36.1771 29.9375 35.4062C29.875 34.6354 29.8958 33.8333 30 33C30.1042 32.1667 30.125 31.3646 30.0625 30.5938C30 29.8229 29.8438 29.2083 29.5938 28.75C29.3438 28.2917 28.8125 28.0417 28 28C27.2917 28 26.8021 28.1979 26.5312 28.5938C26.2604 28.9896 26.0938 29.4792 26.0312 30.0625C25.9688 30.6458 25.9583 31.2917 26 32C26.0417 32.7083 26.0417 33.3438 26 33.9062C25.9583 34.4688 25.7917 34.9688 25.5 35.4062C25.2083 35.8438 24.7083 36.0417 24 36C23.4583 36 22.9896 35.8021 22.5938 35.4062C22.1979 35.0104 22 34.5417 22 34V14C22 13.4583 21.8021 12.9896 21.4062 12.5938C21.0104 12.1979 20.5417 12 20 12C19.4583 12 18.9896 12.1979 18.5938 12.5938C18.1979 12.9896 18 13.4583 18 14V38.5938C18 39.0729 17.9167 39.5104 17.75 39.9062C17.5833 40.3021 17.3438 40.6667 17.0312 41C16.7188 41.3333 16.3542 41.5729 15.9375 41.7188C15.5208 41.8646 15.0833 41.9583 14.625 42C14.1667 42 13.7292 41.9167 13.3125 41.75C12.8958 41.5833 12.5104 41.3333 12.1562 41L7.8125 36.6562C7.375 36.2188 6.85417 36 6.25 36C5.64583 36 5.125 36.2188 4.6875 36.6562C4.25 37.0938 4.02083 37.625 4 38.25C4 38.8542 4.21875 39.375 4.65625 39.8125L19.4062 54.5938C21.1562 56.3438 23.0729 57.6771 25.1562 58.5938C27.2396 59.5104 29.5208 59.9792 32 60C33.9375 60 35.75 59.6354 37.4375 58.9062C39.125 58.1771 40.6042 57.1771 41.875 55.9062C43.1458 54.6354 44.1458 53.1562 44.875 51.4688C45.6042 49.7812 45.9792 47.9583 46 46V34Z"
      fill="#B87DE8"
    />
  </svg>
);

export const LoseLineSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg width={68} height={42} viewBox="0 0 68 42" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 14.5L18 3L32 28L45 15.5L65 39.5" stroke="#B87DE8" strokeWidth={4} />
    <path d="M58.5 39L65.5 40L66.5 33" stroke="#B87DE8" strokeWidth={2} />
  </svg>
);

export const ColorSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg width={50} height={50} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M40.2778 25C39.1727 25 38.1129 24.561 37.3315 23.7796C36.5501 22.9982 36.1111 21.9384 36.1111 20.8333C36.1111 19.7283 36.5501 18.6685 37.3315 17.8871C38.1129 17.1057 39.1727 16.6667 40.2778 16.6667C41.3828 16.6667 42.4427 17.1057 43.2241 17.8871C44.0055 18.6685 44.4444 19.7283 44.4444 20.8333C44.4444 21.9384 44.0055 22.9982 43.2241 23.7796C42.4427 24.561 41.3828 25 40.2778 25ZM31.9444 13.8889C30.8394 13.8889 29.7796 13.4499 28.9982 12.6685C28.2168 11.8871 27.7778 10.8273 27.7778 9.72222C27.7778 8.61715 28.2168 7.55734 28.9982 6.77594C29.7796 5.99454 30.8394 5.55556 31.9444 5.55556C33.0495 5.55556 34.1093 5.99454 34.8907 6.77594C35.6721 7.55734 36.1111 8.61715 36.1111 9.72222C36.1111 10.8273 35.6721 11.8871 34.8907 12.6685C34.1093 13.4499 33.0495 13.8889 31.9444 13.8889ZM18.0556 13.8889C16.9505 13.8889 15.8907 13.4499 15.1093 12.6685C14.3279 11.8871 13.8889 10.8273 13.8889 9.72222C13.8889 8.61715 14.3279 7.55734 15.1093 6.77594C15.8907 5.99454 16.9505 5.55556 18.0556 5.55556C19.1606 5.55556 20.2204 5.99454 21.0018 6.77594C21.7832 7.55734 22.2222 8.61715 22.2222 9.72222C22.2222 10.8273 21.7832 11.8871 21.0018 12.6685C20.2204 13.4499 19.1606 13.8889 18.0556 13.8889ZM9.72222 25C8.61715 25 7.55734 24.561 6.77594 23.7796C5.99454 22.9982 5.55556 21.9384 5.55556 20.8333C5.55556 19.7283 5.99454 18.6685 6.77594 17.8871C7.55734 17.1057 8.61715 16.6667 9.72222 16.6667C10.8273 16.6667 11.8871 17.1057 12.6685 17.8871C13.4499 18.6685 13.8889 19.7283 13.8889 20.8333C13.8889 21.9384 13.4499 22.9982 12.6685 23.7796C11.8871 24.561 10.8273 25 9.72222 25ZM25 0C18.3696 0 12.0107 2.63392 7.32233 7.32233C2.63392 12.0107 0 18.3696 0 25C0 31.6304 2.63392 37.9893 7.32233 42.6777C12.0107 47.3661 18.3696 50 25 50C26.1051 50 27.1649 49.561 27.9463 48.7796C28.7277 47.9982 29.1667 46.9384 29.1667 45.8333C29.1667 44.75 28.75 43.7778 28.0833 43.0556C27.4444 42.3056 27.0278 41.3333 27.0278 40.2778C27.0278 39.1727 27.4668 38.1129 28.2482 37.3315C29.0296 36.5501 30.0894 36.1111 31.1944 36.1111H36.1111C39.7947 36.1111 43.3274 34.6478 45.932 32.0431C48.5367 29.4385 50 25.9058 50 22.2222C50 9.94444 38.8056 0 25 0Z"
      fill="#B87DE8"
    />
  </svg>
);

export const MagnifyingGlassSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg width={50} height={50} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M18.5714 0C23.4969 0 28.2206 1.95663 31.7034 5.43945C35.1862 8.92226 37.1429 13.646 37.1429 18.5714C37.1429 23.1714 35.4571 27.4 32.6857 30.6571L33.4571 31.4286H35.7143L50 45.7143L45.7143 50L31.4286 35.7143V33.4571L30.6571 32.6857C27.2868 35.5613 23.0018 37.1416 18.5714 37.1429C13.646 37.1429 8.92226 35.1862 5.43945 31.7034C1.95663 28.2206 0 23.4969 0 18.5714C0 13.646 1.95663 8.92226 5.43945 5.43945C8.92226 1.95663 13.646 0 18.5714 0ZM18.5714 5.71429C11.4286 5.71429 5.71429 11.4286 5.71429 18.5714C5.71429 25.7143 11.4286 31.4286 18.5714 31.4286C25.7143 31.4286 31.4286 25.7143 31.4286 18.5714C31.4286 11.4286 25.7143 5.71429 18.5714 5.71429Z"
      fill="#B87DE8"
    />
  </svg>
);
