"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface ConfirmFormProps {
  action: (formData: FormData) => Promise<any> | void;
  confirmText?: string;
  buttonText: string;
  buttonClassName?: string;
  disabledClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ConfirmForm({
  action,
  confirmText = "Are you sure you want to submit this form?",
  buttonText,
  buttonClassName = "",
  disabledClassName = "opacity-50 cursor-not-allowed",
  className = "",
  children,
}: ConfirmFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirm(confirmText)) return;

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        console.error("Form action execution failed:", err);
        alert("An error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      <button
        type="submit"
        disabled={isPending}
        className={`${buttonClassName} ${isPending ? disabledClassName : ""}`}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </span>
        ) : (
          buttonText
        )}
      </button>
    </form>
  );
}
