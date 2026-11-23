"use client";

import {
  Controller,
  type Path,
  type Control,
  type FieldValues,
} from "react-hook-form";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { ImageUpIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";

type ImageValue = string | Blob | null | undefined;

type SingleFormImageUploaderProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  className?: string;
  accept?: string;
  // Shown under the drop text, e.g. "PNG or SVG, up to 1MB"
  hint?: string;
};

export default function SingleFormImageUploader<T extends FieldValues>({
  name,
  control,
  label,
  required,
  className,
  accept = "image/*",
  hint,
}: SingleFormImageUploaderProps<T>) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={className} data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel
              htmlFor={id}
              className={cn(
                "text-sm font-medium",
                required &&
                  "after:ms-0.5 after:text-destructive after:content-['*']",
              )}
            >
              {label}
            </FieldLabel>
          )}

          <ImageDropzone
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

function ImageDropzone({
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
  const format = useFormatter();
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

  const fileName =
    value instanceof File
      ? value.name
      : typeof value === "string"
        ? decodeURIComponent(value.split("/").pop() ?? "")
        : "";

  return (
    <>
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

      {previewUrl ? (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted">
            <Image
              src={previewUrl}
              alt=""
              width={64}
              height={64}
              unoptimized={value instanceof Blob}
              className="size-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {fileName || t("selected")}
            </p>
            <p className="text-xs text-muted-foreground">
              {value instanceof Blob
                ? format.number(value.size / 1024, {
                    maximumFractionDigits: 0,
                  }) + " KB"
                : t("current")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={pick}
              className="text-xs text-muted-foreground"
            >
              <RefreshCwIcon />
              {t("replace")}
            </Button>
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
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onBlur={onBlur}
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
            "group flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors outline-none",
            "hover:border-primary/60 hover:bg-primary/5 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
            dragging && "border-primary bg-primary/10",
            invalid && "border-destructive/60 bg-destructive/5",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-xs ring-1 ring-border transition-transform group-hover:scale-105">
            <ImageUpIcon className="size-5" />
          </span>

          <span className="space-y-1">
            <span className="block text-sm text-foreground">
              <span className="font-semibold text-primary">{t("click")}</span>{" "}
              {t("orDrag")}
            </span>
            <span className="block text-xs text-muted-foreground">
              {hint ?? t("hint")}
            </span>
          </span>
        </button>
      )}
    </>
  );
}
