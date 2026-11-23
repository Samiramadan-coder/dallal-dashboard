import { Gem } from "lucide-react";
import { getTranslations } from "next-intl/server";

// Signed-in users are redirected away from guest-only pages by proxy.ts
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Auth.Panel");

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-105 shrink-0 flex-col justify-between bg-secondary p-10 text-card">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-lg">
            <Gem className="size-4 text-secondary" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-bold tracking-widest uppercase text-primary">
              {t("BrandName")}
            </p>
            <p className="text-[11px] text-card/60">{t("BrandSubtitle")}</p>
          </div>
        </div>

        <div>
          <h1 className="text-[26px] font-bold leading-tight whitespace-pre-line">
            {t("Headline")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-card/70">
            {t("Subheadline")}
          </p>
        </div>

        <p className="text-xs text-card/50">{t("Footer")}</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
