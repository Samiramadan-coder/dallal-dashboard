"use client";

import {
  Controller,
  type Path,
  type Control,
  type FieldValues,
} from "react-hook-form";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageIcon, ImagePlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";

type ImageValue = string | Blob | null | undefined;

// A small square preview with a "Choose photo" button and a hint beside it.
// Same value contract as SingleFormImageUploader: the current URL, a picked
// file, or "" once removed
export default function CompactImageUploader<T extends FieldValues>({
  name,
  control,
  label,
  hint,
  accept = "image/*",
  className,
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  hint?: string;
  accept?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={cn("gap-2", className)} data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={id} className="text-sm font-medium">
              {label}
            </FieldLabel>
          )}

          <Picker
            id={id}
            value={field.value as ImageValue}
            onChange={field.onChange}
            onBlur={field.onBlur}
            accept={accept}
            hint={hint}
            invalid={fieldState.invalid}
          />

          <FieldError errors={[fieldState.error]} className="text-xs" />
        </Field>
      )}
    />
  );
}

function Picker({
  id,
  value,
  onChange,
  onBlur,
  accept,
  hint,
  invalid,
}: {
  id: string;
  value: ImageValue;
  onChange: (value: string | Blob) => void;
  onBlur: () => void;
  accept: string;
  hint?: string;
  invalid: boolean;
}) {
  const t = useTranslations("Common.Upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Object URLs are revoked when the file changes or the form unmounts
  const previewUrl = useMemo(() => {
    if (typeof value === "string") return value || null;
    if (value instanceof Blob) return URL.createObjectURL(value);
    return null;
  }, [value]);

  useEffect(() => {
    if (!(value instanceof Blob) || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [value, previewUrl]);

  const pick = () => inputRef.current?.click();

  const acceptFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    onChange(file);
  };

  return (
    <div className="flex items-center gap-4">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {/* Also a drop target; the button beside it is the keyboard path */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          acceptFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground transition-colors",
          dragging && "border-secondary bg-secondary/10",
          invalid && "border-destructive/60",
        )}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt=""
            width={80}
            height={80}
            unoptimized={value instanceof Blob}
            className="size-full object-cover"
          />
        ) : (
          <ImageIcon aria-hidden className="size-6" />
        )}
      </div>

      <div className="flex min-w-0 flex-col items-start gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={pick}
            onBlur={onBlur}
            className="font-semibold"
          >
            <ImagePlusIcon />
            {previewUrl ? t("replace") : t("choose")}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("remove")}
              onClick={() => {
                onChange("");
                onBlur();
              }}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{hint ?? t("hint")}</p>
      </div>
    </div>
  );
}
