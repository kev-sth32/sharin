import { cn } from "@/lib/utils";
import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "cream";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#FF4A7D] text-white hover:bg-[#E63E6E] shadow-[0_8px_20px_-4px_rgba(255,74,125,0.4)] active:scale-[0.98] border border-transparent",
  secondary: "bg-[#5B2063] text-white hover:bg-[#46204D] shadow active:scale-[0.98]",
  ghost: "bg-transparent text-[#13253D] hover:bg-[#FFF0F4]",
  outline: "border border-[#13253D]/20 bg-white text-[#13253D] hover:bg-[#FFF8F0] hover:border-[#FF4A7D]/30",
  cream: "bg-[#FFF8F0] text-[#13253D] border border-[#F1D9D0] hover:bg-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-6 text-[15px] rounded-full",
  lg: "h-14 px-8 text-[16px] rounded-full font-semibold",
  icon: "h-10 w-10 rounded-full p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4A7D]/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
