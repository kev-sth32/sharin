"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface ConfirmButtonProps {
  action: () => Promise<any> | void;
  confirmText?: string;
  className?: string;
  disabledClassName?: string;
  children: React.ReactNode;
}

export default function ConfirmButton({
  action,
  confirmText = "Are you sure you want to perform this action?",
  className = "",
  disabledClassName = "opacity-50 cursor-not-allowed",
  children,
}: ConfirmButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!window.confirm(confirmText)) return;

    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        console.error("Action execution failed:", err);
        alert("An error occurred. Please try again.");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${className} ${isPending ? disabledClassName : ""}`}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Wait...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
