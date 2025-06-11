import React from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties['animationDuration'];
    enableModeTransition?: boolean;
  }

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  enableModeTransition = true,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";
  return (
    <Component className={`relative inline-block py-[3px] overflow-hidden rounded-[20px] transition-transform duration-200 hover:scale-105 ${enableModeTransition ? 'mode-transition-btn' : ''} ${className}`} {...rest}>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      {enableModeTransition && (
        <div className="mode-transition-overlay rounded-[20px]"></div>
      )}
      <div className="relative z-[5] bg-gradient-to-b from-gray-500 to-black dark:from-white-800 dark:to-white border border-gray-700 dark:border-gray-800 dark:text-gray-900 font-bold text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px] shadow-md">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;