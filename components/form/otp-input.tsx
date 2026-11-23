"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

type OtpInputProps = {
  // Digits only, filled from the start (no gaps)
  value: string;
  onChange: (value: string) => void;
  // Called once every box is filled
  onComplete?: (value: string) => void;
  length?: number;
  // Given to the first box, so a LabeledField label points at it
  id?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

// One box per digit. Typing moves forward, Backspace moves back, and pasting
// (or the browser's one-time-code autofill) fills every box at once
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  id,
  disabled,
  autoFocus,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = (index: number) => {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();
  };

  const update = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    focusBox(clean.length);
    if (clean.length === length) onComplete?.(clean);
  };

  const handleChange = (index: number, input: string) => {
    const typed = input.replace(/\D/g, "");
    if (!typed) return;
    // Several digits at once means a paste or autofill
    update(value.slice(0, index) + typed + value.slice(index + typed.length));
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    switch (event.key) {
      case "Backspace":
        event.preventDefault();
        if (digits[index]) {
          update(value.slice(0, index) + value.slice(index + 1));
          focusBox(index);
        } else if (index > 0) {
          update(value.slice(0, index - 1) + value.slice(index));
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusBox(index - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        focusBox(index + 1);
        break;
    }
  };

  return (
    // Codes read left to right in Arabic too
    <div dir="ltr" className={cn("flex gap-2.5", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          id={index === 0 ? id : undefined}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={index === 0 ? undefined : `${index + 1} / ${length}`}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          // Never leave a gap: jump to the first empty box
          onFocus={(event) => {
            if (index > value.length) focusBox(value.length);
            else event.target.select();
          }}
          className={cn(
            "h-12 w-full min-w-0 flex-1 rounded-lg border border-border bg-card text-center text-lg font-semibold text-foreground outline-none transition-[border-color,box-shadow]",
            "focus-visible:border-secondary focus-visible:ring-3 focus-visible:ring-secondary/20",
            "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
