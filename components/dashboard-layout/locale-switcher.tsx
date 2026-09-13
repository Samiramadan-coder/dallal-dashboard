"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="ghost"
      className="text-white bg-[#0f4a31] hover:bg-[#0f4a31] hover:text-white rounded-md"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      aria-label="switcher"
    >
      <Globe className="size-4" />
      <span className="text-xs font-normal">
        {locale === "ar" ? "En" : "AR"}
      </span>
    </Button>
  );
}
