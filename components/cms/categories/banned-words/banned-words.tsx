"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import type { BannedWord } from "@/types/categories";
import type { Country } from "@/types/countries";
import type { Locale } from "@/types/shared";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createBannedWord,
  deleteBannedWord,
  testBannedWords,
} from "@/lib/actions/banned-words";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// "all" stands for words with no country, which apply everywhere
type Scope = "all" | `${number}`;

const ARABIC = /\p{Script=Arabic}/u;

// The API doesn't say which language a word is in; Arabic letters decide it
const isArabic = (word: string) => ARABIC.test(word);

// Words that send a listing to review, everywhere or in one country, split
// into English and Arabic, and a box to test a title against them
export default function BannedWords({
  words,
  countries: allCountries,
}: {
  words: BannedWord[];
  countries: Country[];
}) {
  const t = useTranslations("Cms.categories.bannedWords");
  const locale = useLocale() as Locale;
  const id = useId();
  const [scope, setScope] = useState<Scope>("all");

  // Only live countries take listings
  const countries = allCountries.filter((country) => country.status === "live");
  const countryId = scope === "all" ? null : Number(scope);

  const scoped = words.filter((word) => word.country_id === countryId);

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby={`${id}-title`}
        className="flex flex-col gap-5 rounded-xl border bg-card p-5"
      >
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2
              id={`${id}-title`}
              className="text-base font-semibold text-foreground"
            >
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor={`${id}-scope`}
              className="text-xs font-medium text-muted-foreground"
            >
              {t("scope")}
            </label>
            <Select
              value={scope}
              onValueChange={(value) => setScope(value as Scope)}
            >
              <SelectTrigger id={`${id}-scope`} className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCountries")}</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    <Image
                      src={country.flag}
                      alt=""
                      width={16}
                      height={12}
                      className="h-3 w-4 rounded-xs object-cover"
                    />
                    {country.name[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {scope !== "all" && (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {t("scopeNote")}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {(["en", "ar"] as const).map((lang) => (
            <WordList
              // A fresh input per country, so a half-typed word doesn't move
              key={`${scope}-${lang}`}
              lang={lang}
              countryId={countryId}
              words={scoped.filter((w) => isArabic(w.word) === (lang === "ar"))}
              taken={scoped.map((w) => w.word.toLowerCase())}
            />
          ))}
        </div>
      </section>

      {/* Retests the current title whenever the list changes */}
      <TitleTester listVersion={words.map((word) => word.id).join(",")} />
    </div>
  );
}

function WordList({
  lang,
  countryId,
  words,
  taken,
}: {
  lang: "en" | "ar";
  countryId: number | null;
  words: BannedWord[];
  // Every word already in this scope, lowercased, to skip duplicates
  taken: string[];
}) {
  const t = useTranslations("Cms.categories.bannedWords");
  const tCommon = useTranslations("Common");
  const id = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const add = async () => {
    const word = draft.trim();
    if (!word || saving) return;

    if (taken.includes(word.toLowerCase())) {
      setError(t("duplicate"));
      return;
    }

    setSaving(true);
    setError(null);
    const result = await createBannedWord({ word, country_id: countryId });
    setSaving(false);

    if (!result.ok) {
      setError(result.fieldErrors?.word || result.message || null);
      toast.error(result.message || tCommon("CreationFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("CreatedSuccessfully"));
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {t(`languages.${lang}`)}
      </label>

      {words.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("none")}</p>
      ) : (
        <ul dir={dir} className="flex flex-wrap gap-2">
          {words.map((word) => (
            <WordChip key={word.id} word={word} />
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1 md:max-w-xs">
        <div className="relative">
          <Input
            id={id}
            dir={dir}
            value={draft}
            disabled={saving}
            placeholder={t("placeholder")}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            className="h-10 pe-9"
          />
          {saving && (
            <Spinner className="absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// A saved word; × deletes it right away (re-adding it is easy, so there's
// no confirmation)
function WordChip({ word }: { word: BannedWord }) {
  const t = useTranslations("Cms.categories.bannedWords");
  const tCommon = useTranslations("Common");
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const result = await deleteBannedWord(word.id);

    if (!result.ok) {
      setDeleting(false);
      toast.error(result.message || tCommon("DeleteFailed"));
      return;
    }

    // The chip disappears when the list refreshes
    toast.success(result.data.message || tCommon("DeletedSuccessfully"));
  };

  return (
    <li
      className={cn(
        "flex items-center gap-1.5 rounded-full border bg-muted/40 py-1 ps-3 pe-1.5 text-sm text-foreground transition-opacity",
        deleting && "opacity-50",
      )}
    >
      <span>{word.word}</span>
      <button
        type="button"
        disabled={deleting}
        aria-label={t("remove", { word: word.word })}
        onClick={remove}
        className="flex size-5 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-default"
      >
        {deleting ? <Spinner className="size-3" /> : <X className="size-3.5" />}
      </button>
    </li>
  );
}

type TestResult =
  | { text: string; ok: true; triggersReview: boolean; words: string[] }
  | { text: string; ok: false };

// Wait this long after the last keystroke before asking the server
const TEST_DELAY = 400;

// Checks a sample title with the backend, which matches exactly the way it
// checks real listings
function TitleTester({ listVersion }: { listVersion: string }) {
  const t = useTranslations("Cms.categories.bannedWords.tester");
  const id = useId();
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const text = title.trim();

  useEffect(() => {
    if (!text) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      const response = await testBannedWords(text);
      // A newer title (or list) replaced this one while it was being checked
      if (cancelled) return;

      setResult(
        response.ok
          ? {
              text,
              ok: true,
              triggersReview: response.data.triggers_review,
              words: response.data.words,
            }
          : { text, ok: false },
      );
    }, TEST_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, listVersion]);

  // The shown result belongs to an older title until the new one comes back
  const checking = Boolean(text) && result?.text !== text;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-4 rounded-xl border bg-card p-5"
    >
      <header className="flex flex-col gap-0.5">
        <h2
          id={`${id}-title`}
          className="text-base font-semibold text-foreground"
        >
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <Input
        aria-labelledby={`${id}-title`}
        value={title}
        placeholder={t("placeholder")}
        onChange={(event) => setTitle(event.target.value)}
        className="h-10"
      />

      <div aria-live="polite" className="text-sm">
        {!text ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : checking || !result ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-3.5" />
            {t("checking")}
          </p>
        ) : !result.ok ? (
          <p className="text-destructive">{t("failed")}</p>
        ) : !result.triggersReview ? (
          <p className="font-medium text-secondary">{t("clean")}</p>
        ) : result.words.length === 0 ? (
          <p className="font-medium text-destructive">{t("flaggedNoWords")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-destructive">
              {t("flagged", { count: result.words.length })}
            </p>
            <ul className="flex flex-wrap gap-2">
              {result.words.map((word) => (
                <li
                  key={word}
                  className="rounded-full bg-destructive/10 px-3 py-1 text-destructive"
                >
                  {word}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
