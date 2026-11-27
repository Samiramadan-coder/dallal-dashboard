import type { FieldError as FormFieldError } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import InfoTip from "@/components/reusable/info-tip";

type LabeledFieldProps = {
  // The control's id; the label points at it
  id: string;
  label: string;
  error?: FormFieldError;
  // Shows an asterisk; validation itself stays with the form's schema
  required?: boolean;
  // Shown at the end of the label row, e.g. a "Forgot password?" link
  labelAction?: React.ReactNode;
  // Explanation behind an ⓘ next to the label (see reusable/info-tip)
  tip?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  children: React.ReactNode;
};

function errorId(id: string) {
  return `${id}-error`;
}

// Spread onto the control inside a LabeledField, so screen readers announce
// it as invalid and read the error message
export function fieldA11yProps(id: string, error?: FormFieldError) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId(id) : undefined,
  };
}

// Label, control and error message. The class props let a form family
// (e.g. auth) restyle every part without its own wrapper
export function LabeledField({
  id,
  label,
  error,
  required = false,
  labelAction,
  tip,
  className,
  labelClassName,
  errorClassName,
  children,
}: LabeledFieldProps) {
  const labelText = (
    <FieldLabel
      htmlFor={id}
      className={cn("text-sm leading-snug font-medium", labelClassName)}
    >
      {label}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </FieldLabel>
  );

  // The ⓘ is a button, so it sits beside the <label>, not inside it
  const labelElement = tip ? (
    <div className="flex items-center gap-1.5">
      {labelText}
      <InfoTip content={tip} />
    </div>
  ) : (
    labelText
  );

  return (
    <Field data-invalid={!!error} className={cn("gap-2", className)}>
      {labelAction ? (
        <div className="flex items-center justify-between gap-3">
          {labelElement}
          {labelAction}
        </div>
      ) : (
        labelElement
      )}

      {children}

      <FieldError
        id={errorId(id)}
        className={cn("text-[13px]", errorClassName)}
        errors={[error]}
      />
    </Field>
  );
}
