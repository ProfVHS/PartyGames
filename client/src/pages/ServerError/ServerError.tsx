import "./Style.scss";
import { motion, SVGMotionProps } from "framer-motion";

export const ServerError = () => {
  return (
    <div className="serverError">
      <ErrorIcon className="serverError-icon" />
      <h1 className="serverError-header">Server Error</h1>
      <span className="serverError-description">We're having some server issues. Please try again later.</span>
      <button className="serverError-button" onClick={() => window.location.reload()}>
        Refresh
      </button>
    </div>
  );
};

const ErrorIcon = (props: SVGMotionProps<SVGSVGElement>) => (
  <motion.svg
    width={20}
    height={20}
    animate={{ scale: [0.9, 1, 1.1] }}
    transition={{ duration: 2, repeat: Infinity, type: "spring", repeatType: "reverse", repeatDelay: 0 }}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 15C10.2833 15 10.521 14.904 10.713 14.712C10.905 14.52 11.0007 14.2827 11 14C10.9993 13.7173 10.9033 13.48 10.712 13.288C10.5207 13.096 10.2833 13 10 13C9.71667 13 9.47933 13.096 9.288 13.288C9.09667 13.48 9.00067 13.7173 9 14C8.99933 14.2827 9.09533 14.5203 9.288 14.713C9.48067 14.9057 9.718 15.0013 10 15ZM9 11H11V5H9V11ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667932 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20Z"
      fill="black"
    />
  </motion.svg>
);
