"use client";

import { useId, useState } from "react";
import { Lock, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  CategoryDetail,
  CategoryField,
  PricingMode,
  Translated,
} from "@/types/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldCard, { type FieldDraft, newUid, toFieldDraft } from "./field-card";

// Icon keys the API uses for categories
const ICONS = [
  "ring",
  "bar",
  "diamond",
  "watch",
  "gem",
  "tools",
  "silver",
  "smartwatch",
  "accessory",
  "antique",
  "beads",
];

const PRICING_MODES: PricingMode[] = ["live", "fixed"];

type Draft = {
  name: Translated;
  icon: string | null;
  sort: number;
  pricing_mode: PricingMode;
  fields: FieldDraft[];
};

function toDraft(category: CategoryDetail): Draft {
  return {
    name: category.name,
    icon: category.icon,
    sort: category.sort,
    pricing_mode: category.pricing_mode,
    fields: [...category.fields]
      .sort((a, b) => a.sort - b.sort)
      .map(toFieldDraft),
  };
}

function emptyField(category: CategoryDetail): FieldDraft {
  const field: CategoryField = {
    id: 0,
    category_id: category.id,
    key: "",
    label: { en: "", ar: "" },
    type: "text",
    options: null,
    units: null,
    required: false,
    filterable: false,
    hidden_from_public: false,
    validation: null,
    show_if: null,
    audience: null,
    sort: 0,
    is_active: true,
  };
  return { ...toFieldDraft(field), id: null, uid: newUid() };
}

// Edits are kept in local state only; saving isn't wired up yet
export default function CategoryForm({
  category,
}: {
  category: CategoryDetail;
}) {
  const t = useTranslations("Cms.categories.form");
  const id = useId();
  const [draft, setDraft] = useState(() => toDraft(category));

  function setFields(change: (fields: FieldDraft[]) => FieldDraft[]) {
    setDraft((d) => ({ ...d, fields: change(d.fields) }));
  }

  function moveField(index: number, by: -1 | 1) {
    setFields((fields) => {
      const next = [...fields];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_8rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name-en`}>{t("nameEn")}</Label>
          <Input
            id={`${id}-name-en`}
            dir="ltr"
            className="h-9"
            value={draft.name.en}
            onChange={(e) =>
              setDraft((d) => ({ ...d, name: { ...d.name, en: e.target.value } }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name-ar`}>{t("nameAr")}</Label>
          <Input
            id={`${id}-name-ar`}
            dir="rtl"
            className="h-9"
            value={draft.name.ar}
            onChange={(e) =>
              setDraft((d) => ({ ...d, name: { ...d.name, ar: e.target.value } }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-icon`}>{t("icon")}</Label>
          <Select
            value={draft.icon ?? undefined}
            onValueChange={(icon) => setDraft((d) => ({ ...d, icon }))}
          >
            <SelectTrigger id={`${id}-icon`} className="h-9 w-full">
              <SelectValue placeholder={t("iconPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {/* Keep an icon the API sent that isn't in the known list */}
              {[...new Set([...ICONS, ...(draft.icon ? [draft.icon] : [])])].map(
                (icon) => (
                  <SelectItem key={icon} value={icon}>
                    {t.has(`icons.${icon}`) ? t(`icons.${icon}`) : icon}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-sort`}>{t("sort")}</Label>
          <Input
            id={`${id}-sort`}
            type="number"
            min={1}
            className="h-9"
            value={Number.isNaN(draft.sort) ? "" : draft.sort}
            onChange={(e) =>
              setDraft((d) => ({ ...d, sort: e.target.valueAsNumber }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{t("whoCanPost")}</p>
          {/* The API stores one audience per category, so this isn't editable */}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock aria-hidden className="size-3.5 shrink-0" />
            {t(`audienceLocked.${category.audience}`)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-pricing`}>{t("pricingMode")}</Label>
          <Select
            value={draft.pricing_mode}
            onValueChange={(mode) =>
              setDraft((d) => ({ ...d, pricing_mode: mode as PricingMode }))
            }
          >
            <SelectTrigger id={`${id}-pricing`} className="h-9 w-full sm:w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICING_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {t(`pricingModes.${mode}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <section aria-labelledby={`${id}-fields`} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 id={`${id}-fields`} className="text-sm font-semibold text-foreground">
            {t("listingFields")}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-secondary hover:text-secondary"
            onClick={() => setFields((fields) => [...fields, emptyField(category)])}
          >
            <Plus />
            {t("addField")}
          </Button>
        </div>

        {draft.fields.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
            {t("noFields")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {draft.fields.map((field, index) => (
              <li key={field.uid}>
                <FieldCard
                  field={field}
                  isFirst={index === 0}
                  isLast={index === draft.fields.length - 1}
                  onChange={(next) =>
                    setFields((fields) =>
                      fields.map((f) => (f.uid === field.uid ? next : f)),
                    )
                  }
                  onMoveUp={() => moveField(index, -1)}
                  onMoveDown={() => moveField(index, 1)}
                  onRemove={() =>
                    setFields((fields) =>
                      fields.filter((f) => f.uid !== field.uid),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
