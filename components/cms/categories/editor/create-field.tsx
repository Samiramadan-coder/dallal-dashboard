"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type FieldError,
  type SubmitHandler,
} from "react-hook-form";
import {
  FIELD_TYPES,
  newFieldSchema,
  type CreateFieldPayload,
  type FieldType,
  type NewFieldValues,
} from "@/types/categories";
import { createCategoryField } from "@/lib/actions/categories";
import { toKey } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import ErrorInput from "./error-input";
import { useAutoKey } from "./use-auto-key";

const FLAGS = ["required", "filterable", "hidden_from_public"] as const;

const EMPTY_FIELD: NewFieldValues = {
  key: "",
  label: { en: "", ar: "" },
  type: "text",
  options: [],
  units: [],
  required: false,
  filterable: false,
  hidden_from_public: false,
};

// A choice added here has no value yet; it's made from its English name
function withValues<T extends { value: string; label: { en: string } }>(
  choices: T[],
): T[] {
  return choices.map((choice) => ({
    ...choice,
    value: choice.value || toKey(choice.label.en),
  }));
}

// Body for POST /admin/catalog/fields; only the choice list the type uses
function toPayload(
  categoryId: number,
  field: NewFieldValues,
): CreateFieldPayload {
  return {
    category_id: categoryId,
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    filterable: field.filterable,
    hidden_from_public: field.hidden_from_public,
    ...(field.type === "select" && { options: withValues(field.options) }),
    ...(field.type === "unit_number" && { units: withValues(field.units) }),
  };
}

// Adds one listing field to a category, then refreshes the category's
// saved lists
export default function CreateField({
  categoryId,
  reload,
}: {
  categoryId: number;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<NewFieldValues>({
    resolver: zodResolver(newFieldSchema((key) => t(key as never))),
    defaultValues: EMPTY_FIELD,
  });

  const {
    control,
    register,
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const type = useWatch({ control, name: "type" });
  const autoKey = useAutoKey((key) => setValue("key", key));
  const labelEn = register("label.en");
  const key = register("key");

  const onSubmit: SubmitHandler<NewFieldValues> = async (data) => {
    const result = await createCategoryField(toPayload(categoryId, data));

    if (!result.ok) {
      // Laravel keys like "label.en" or "options.0.label.en" map onto the form
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof NewFieldValues, { type: "server", message });
      });
      toast.error(result.message || tCommon("CreationFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("CreatedSuccessfully"));
    await reload();
    reset(EMPTY_FIELD);
    autoKey.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-secondary hover:text-secondary"
        >
          <Plus />
          {t("addField")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-2xl"
      >
        <Header title={t("addField")} description={t("addFieldDescription")} />

        <FormProvider {...form}>
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <LabeledField
                required
                id={`${id}-label-en`}
                label={t("fieldLabelEn")}
                error={errors.label?.en}
              >
                <Input
                  {...labelEn}
                  onChange={(event) => {
                    autoKey.follow(event.target.value);
                    return labelEn.onChange(event);
                  }}
                  {...fieldA11yProps(`${id}-label-en`, errors.label?.en)}
                  dir="ltr"
                  placeholder={t("fieldLabelPlaceholderEn")}
                  className="h-10 bg-background"
                />
              </LabeledField>

              <LabeledField
                required
                id={`${id}-label-ar`}
                label={t("fieldLabelAr")}
                error={errors.label?.ar}
              >
                <Input
                  {...register("label.ar")}
                  {...fieldA11yProps(`${id}-label-ar`, errors.label?.ar)}
                  dir="rtl"
                  placeholder={t("fieldLabelPlaceholderAr")}
                  className="h-10 bg-background"
                />
              </LabeledField>

              <LabeledField
                required
                id={`${id}-key`}
                label={t("fieldKey")}
                error={errors.key}
              >
                <Input
                  {...key}
                  onChange={(event) => {
                    autoKey.markEdited();
                    return key.onChange(event);
                  }}
                  {...fieldA11yProps(`${id}-key`, errors.key)}
                  dir="ltr"
                  placeholder={t("fieldKeyPlaceholder")}
                  className="h-10 bg-background"
                />
                {!errors.key && (
                  <p className="text-xs text-muted-foreground">
                    {t("keyHint")}
                  </p>
                )}
              </LabeledField>

              <LabeledField id={`${id}-type`} label={t("fieldType")}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const next = value as FieldType;
                        field.onChange(next);
                        // Hidden choice lists would still be validated on save
                        if (next !== "select") setValue("options", []);
                        if (next !== "unit_number") setValue("units", []);
                      }}
                    >
                      <SelectTrigger
                        id={`${id}-type`}
                        aria-describedby={`${id}-type-hint`}
                        onBlur={field.onBlur}
                        className="h-10 w-full bg-background"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((fieldType) => (
                          <SelectItem key={fieldType} value={fieldType}>
                            {t(`fieldTypes.${fieldType}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p
                  id={`${id}-type-hint`}
                  className="text-xs text-muted-foreground"
                >
                  {t(`fieldTypeHints.${type}`)}
                </p>
              </LabeledField>
            </div>

            {type === "select" && <OptionsList />}
            {type === "unit_number" && <UnitsList />}

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-medium text-foreground">
                {t("flagsTitle")}
              </legend>
              {FLAGS.map((flag) => (
                <Controller
                  key={flag}
                  control={control}
                  name={flag}
                  render={({ field }) => (
                    <label
                      htmlFor={`${id}-${flag}`}
                      className="flex cursor-pointer items-start gap-2.5"
                    >
                      <Checkbox
                        id={`${id}-${flag}`}
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        onBlur={field.onBlur}
                        aria-describedby={`${id}-${flag}-hint`}
                        className="mt-0.5 data-checked:border-secondary data-checked:bg-secondary dark:data-checked:bg-secondary"
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">
                          {t(`flags.${flag}`)}
                        </span>
                        <span
                          id={`${id}-${flag}-hint`}
                          className="text-xs text-muted-foreground"
                        >
                          {t(`flagHints.${flag}`)}
                        </span>
                      </span>
                    </label>
                  )}
                />
              ))}
            </fieldset>
          </form>
        </FormProvider>

        <Footer form={formRef} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}

function OptionsList() {
  const t = useTranslations("Cms.categories.form");
  const { control, register, formState } = useFormContext<NewFieldValues>();
  const options = useFieldArray({ control, name: "options", keyName: "uid" });
  const errors = formState.errors.options;

  return (
    <ChoiceList
      title={t("options")}
      hint={t("optionsHint")}
      addLabel={t("addOption")}
      onAdd={() => options.append({ value: "", label: { en: "", ar: "" } })}
    >
      {options.fields.map((option, i) => (
        <ChoiceRow
          key={option.uid}
          onRemove={() => options.remove(i)}
          en={register(`options.${i}.label.en`)}
          ar={register(`options.${i}.label.ar`)}
          errors={errors?.[i]?.label}
        />
      ))}
    </ChoiceList>
  );
}

function UnitsList() {
  const t = useTranslations("Cms.categories.form");
  const { control, register, formState } = useFormContext<NewFieldValues>();
  const units = useFieldArray({ control, name: "units", keyName: "uid" });
  const errors = formState.errors.units;

  return (
    <ChoiceList
      title={t("units")}
      hint={t("unitFactorHint")}
      addLabel={t("addUnit")}
      onAdd={() =>
        units.append({ value: "", factor: 1, label: { en: "", ar: "" } })
      }
    >
      {units.fields.map((unit, i) => (
        <ChoiceRow
          key={unit.uid}
          onRemove={() => units.remove(i)}
          en={register(`units.${i}.label.en`)}
          ar={register(`units.${i}.label.ar`)}
          errors={errors?.[i]?.label}
        >
          <ErrorInput
            {...register(`units.${i}.factor`, { valueAsNumber: true })}
            error={errors?.[i]?.factor}
            errorId={`${unit.uid}-factor-error`}
            type="number"
            step="any"
            min={0}
            aria-label={t("unitFactor")}
            placeholder={t("unitFactor")}
            wrapperClassName="w-24 flex-none"
            className="bg-card"
          />
        </ChoiceRow>
      ))}
    </ChoiceList>
  );
}

// A select's options or a number's units: a titled list with an add button
function ChoiceList({
  title,
  hint,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  hint: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      {children}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit text-secondary hover:text-secondary"
        onClick={onAdd}
      >
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}

function ChoiceRow({
  en,
  ar,
  errors,
  onRemove,
  children,
}: {
  en: React.ComponentProps<"input">;
  ar: React.ComponentProps<"input">;
  errors?: { en?: FieldError; ar?: FieldError };
  onRemove: () => void;
  // Extra inputs between the names and the delete button
  children?: React.ReactNode;
}) {
  const t = useTranslations("Cms.categories.form");
  const id = useId();

  return (
    <div className="flex items-start gap-2">
      <ErrorInput
        {...en}
        error={errors?.en}
        errorId={`${id}-en-error`}
        dir="ltr"
        aria-label={t("choiceEn")}
        placeholder={t("choiceEn")}
        className="bg-card"
      />
      <ErrorInput
        {...ar}
        error={errors?.ar}
        errorId={`${id}-ar-error`}
        dir="rtl"
        aria-label={t("choiceAr")}
        placeholder={t("choiceAr")}
        className="bg-card"
      />
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("removeChoice")}
        className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
