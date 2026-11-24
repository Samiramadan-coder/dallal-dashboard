import type { FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// An input without a visible label (its aria-label names it), with its
// error message under it. Used in the compact rows of the editor
export default function ErrorInput({
  error,
  errorId,
  wrapperClassName,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  error?: FieldError;
  errorId: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1", wrapperClassName)}>
      <Input
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("h-9", className)}
      />
      {error?.message && (
        <p id={errorId} className="text-xs text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
