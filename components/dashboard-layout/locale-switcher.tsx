"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const t = useTranslations("layout.header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
    >
      <Languages className="size-4" aria-hidden />
      <span lang={nextLocale}>
        {nextLocale === "ar" ? "العربية" : "English"}
      </span>
    </Button>
  );
}
