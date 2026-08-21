type GymFlowLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export function GymFlowLogo({
  className = "",
  markClassName = "h-10 w-10",
  textClassName = "text-[21px] font-semibold tracking-[-0.04em] text-[#f4f7f4]",
  showText = true,
}: GymFlowLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center text-[#70e39b] ${markClassName}`}
      >
        <svg
          viewBox="0 0 64 48"
          fill="none"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M53.5 8H30.8C18.5 8 9.8 15.7 7.4 27C5 38.2 12.6 46 25.3 46H40.8L43.4 34.8H29.2C24.1 34.8 21.2 31.9 22.1 27.6C23 23.1 26.7 20.4 32.1 20.4H50.7L53.5 8Z"
            fill="currentColor"
          />

          <path
            d="M36.3 26.2H59.2L57.1 35.2H45.6L43.1 46H31.7L36.3 26.2Z"
            fill="currentColor"
          />
        </svg>
      </span>

      {showText && <span className={textClassName}>GymFlow</span>}
    </div>
  );
}
