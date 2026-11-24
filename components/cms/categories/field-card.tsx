"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  FIELD_TYPES,
  type CategoryField,
  type FieldOption,
  type FieldType,
  type FieldUnit,
  type Translated,
} from "@/types/categories";
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

// Options, units and new fields have no id of their own, so list keys use a
// client-only uid
let uidCounter = 0;
export const newUid = () => `uid-${++uidCounter}`;

type OptionDraft = FieldOption & { uid: string };
type UnitDraft = FieldUnit & { uid: string };

export type FieldDraft = Omit<CategoryField, "id" | "options" | "units"> & {
  // null until the field is saved
  id: number | null;
  uid: string;
  options: OptionDraft[] | null;
  units: UnitDraft[] | null;
};

export function toFieldDraft(field: CategoryField): FieldDraft {
  return {
    ...field,
    uid: `field-${field.id}`,
    options: field.options?.map((o) => ({ ...o, uid: newUid() })) ?? null,
    units: field.units?.map((u) => ({ ...u, uid: newUid() })) ?? null,
  };
}

const FLAGS = ["required", "hidden_from_public", "filterable"] as const;

export default function FieldCard({
  field,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  field: FieldDraft;
  isFirst: boolean;
  isLast: boolean;
  onChange: (field: FieldDraft) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("Cms.categories.form");
  const id = useId();
  const name = field.label.en || t("untitledField");

  function setLabel(label: Partial<Translated>) {
    onChange({ ...field, label: { ...field.label, ...label } });
  }

  function setType(type: FieldType) {
    onChange({
      ...field,
      type,
      // Keep what was there when switching back and forth
      options: type === "select" ? (field.options ?? []) : field.options,
      units: type === "unit_number" ? (field.units ?? []) : field.units,
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        {/* Order is changed with the arrows; drag and drop isn't wired up */}
        <GripVertical
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground/60"
        />

        <Input
          dir="ltr"
          aria-label={t("fieldLabelEn")}
          placeholder={t("fieldLabelEn")}
          className="h-9 flex-1"
          value={field.label.en}
          onChange={(e) => setLabel({ en: e.target.value })}
        />
        <Input
          dir="rtl"
          aria-label={t("fieldLabelAr")}
          placeholder={t("fieldLabelAr")}
          className="h-9 flex-1"
          value={field.label.ar}
          onChange={(e) => setLabel({ ar: e.target.value })}
        />

        <Select value={field.type} onValueChange={(v) => setType(v as FieldType)}>
          <SelectTrigger aria-label={t("fieldType")} className="h-9 w-36 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`fieldTypes.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            aria-label={t("moveUp", { name })}
            className="text-muted-foreground"
            onClick={onMoveUp}
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            aria-label={t("moveDown", { name })}
            className="text-muted-foreground"
            onClick={onMoveDown}
          >
            <ArrowDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("removeField", { name })}
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 ps-6">
        {field.type === "select" && (
          <ChoiceList
            title={t("options")}
            addLabel={t("addOption")}
            items={field.options ?? []}
            onChange={(options) => onChange({ ...field, options })}
            create={() => ({
              uid: newUid(),
              value: "",
              label: { en: "", ar: "" },
            })}
          />
        )}

        {field.type === "unit_number" && (
          <ChoiceList
            title={t("units")}
            addLabel={t("addUnit")}
            items={field.units ?? []}
            onChange={(units) => onChange({ ...field, units })}
            create={() => ({
              uid: newUid(),
              value: "",
              factor: 1,
              label: { en: "", ar: "" },
            })}
            renderExtra={(unit, update) => (
              <Input
                type="number"
                step="any"
                min={0}
                aria-label={t("unitFactor")}
                placeholder={t("unitFactor")}
                title={t("unitFactorHint")}
                className="h-9 w-28 shrink-0"
                value={Number.isNaN(unit.factor) ? "" : unit.factor}
                onChange={(e) => update({ factor: e.target.valueAsNumber })}
              />
            )}
          />
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FLAGS.map((flag) => (
            <label
              key={flag}
              htmlFor={`${id}-${flag}`}
              className="flex cursor-pointer items-center gap-2 text-xs text-foreground"
            >
              <Checkbox
                id={`${id}-${flag}`}
                checked={field[flag]}
                onCheckedChange={(checked) =>
                  onChange({ ...field, [flag]: checked === true })
                }
                className="data-checked:border-secondary data-checked:bg-secondary dark:data-checked:bg-secondary"
              />
              {t(`flags.${flag}`)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Editable list of bilingual choices: a select's options or a number's units
function ChoiceList<T extends { uid: string; label: Translated }>({
  title,
  addLabel,
  items,
  onChange,
  create,
  renderExtra,
}: {
  title: string;
  addLabel: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  renderExtra?: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const t = useTranslations("Cms.categories.form");

  function update(uid: string, patch: Partial<T>) {
    onChange(items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>

      {items.map((item) => (
        <div key={item.uid} className="flex items-center gap-2">
          <Input
            dir="ltr"
            aria-label={t("choiceEn")}
            placeholder={t("choiceEn")}
            className="h-9 flex-1"
            value={item.label.en}
            onChange={(e) =>
              update(item.uid, {
                label: { ...item.label, en: e.target.value },
              } as Partial<T>)
            }
          />
          <Input
            dir="rtl"
            aria-label={t("choiceAr")}
            placeholder={t("choiceAr")}
            className="h-9 flex-1"
            value={item.label.ar}
            onChange={(e) =>
              update(item.uid, {
                label: { ...item.label, ar: e.target.value },
              } as Partial<T>)
            }
          />
          {renderExtra?.(item, (patch) => update(item.uid, patch))}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("removeChoice", { name: item.label.en || "—" })}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange(items.filter((i) => i.uid !== item.uid))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit text-secondary hover:text-secondary"
        onClick={() => onChange([...items, create()])}
      >
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
