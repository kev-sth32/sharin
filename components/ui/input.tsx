import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, type, id, ...props }, ref) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-[13px] font-semibold tracking-wide text-[#13253D]/80 uppercase">{label} {props.required && <span className="text-[#FF4A7D]">*</span>}</label>}
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-[#F1D9D0] bg-white px-4 py-3 text-[15px] text-[#13253D] placeholder:text-[#13253D]/40 shadow-[0_1px_2px_rgba(19,37,61,0.04)] transition-all focus:outline-none focus:border-[#FF4A7D]/50 focus:ring-4 focus:ring-[#FF4A7D]/10 disabled:opacity-50",
          error && "border-red-400 focus:border-red-400 focus:ring-red-100",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(({ className, label, error, id, ...props }, ref) => {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={textareaId} className="text-[13px] font-semibold tracking-wide text-[#13253D]/80 uppercase">{label}</label>}
      <textarea
        id={textareaId}
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-[#F1D9D0] bg-white px-4 py-3 text-[15px] text-[#13253D] placeholder:text-[#13253D]/40 shadow-sm transition-all focus:outline-none focus:border-[#FF4A7D]/50 focus:ring-4 focus:ring-[#FF4A7D]/10",
          error && "border-red-400",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: { value: string; label: string }[] }>(({ className, label, error, id, options, ...props }, ref) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-[13px] font-semibold tracking-wide text-[#13253D]/80 uppercase">{label} {props.required && <span className="text-[#FF4A7D]">*</span>}</label>}
      <select
        id={selectId}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-[#F1D9D0] bg-white px-4 py-3 text-[15px] text-[#13253D] shadow-sm focus:outline-none focus:border-[#FF4A7D]/50 focus:ring-4 focus:ring-[#FF4A7D]/10",
          error && "border-red-400",
          className
        )}
        ref={ref}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});
Select.displayName = "Select";
