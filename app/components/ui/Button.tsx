import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import Loading from "./Loading";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "link";
  size?: "small" | "default";
  loading?: boolean;
};

export const smallClasses = "px-2 py-[2px] font-satoshi-regular text-sm leading-5";
export const base = "relative px-5 py-3 font-satoshi-bold rounded-full text-[rgba(255,255,255,1)] appearance-none";
export const primaryClassNames = twMerge(
  base,
  "bg-tonehunt-blue-dark focus:ring-2 focus:outline-none focus:ring-bg-tonehunt-blue-medium text-center hover:bg-tonehunt-blue-medium focus:bg-tonehunt-blue-medium"
);
export const secondaryClassNames = twMerge(
  base,
  "hover:border-white hover:bg-transparent hover:text-white focus:ring-2 focus:outline-none focus:ring-blue-300  focus:ring-blue-800 border border-white/10"
);
export const disabledClassNames = twMerge(base, "cursor-not-allowed opacity-80 text-white/50");
export const linkClassNames = "p-0 border-0";

// eslint-disable-next-line react/display-name
const Button = forwardRef(
  ({ variant = "primary", size = "default", disabled, className, loading, children, ...props }: ButtonProps, ref) => {
    const classNames = () => {
      switch (variant) {
        case "primary":
          return primaryClassNames;
        case "secondary":
          return secondaryClassNames;
        case "link":
          return linkClassNames;
      }
    };

    return (
      <button
        ref={ref}
        {...props}
        onMouseDown={(e: any) => {
          // Need to simulate the disabled prop on a button because we need the other events
          // to fire for UI puproses
          if (disabled || loading) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }

          props.onMouseDown?.(e);
        }}
        onClick={(e: any) => {
          if (disabled || loading) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }

          props.onClick?.(e);
        }}
        className={twMerge(
          classNames(),
          loading || disabled ? disabledClassNames : "",
          size === "small" ? smallClasses : "",
          className
        )}
      >
        <span className={loading ? "invisible" : ""}>{children}</span>
        {loading ? (
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Loading size="16" />
          </span>
        ) : null}
      </button>
    );
  }
);

export default Button;
