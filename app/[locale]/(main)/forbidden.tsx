import { ShieldOff } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import ForbiddenSection from "@/components/reusable/forbidden-section";

// Shown when a page calls forbidden() (see lib/permissions), with a 403
export default async function Forbidden() {
  const [t, tRoles, format, admin] = await Promise.all([
    getTranslations("forbidden"),
    getTranslations("layout.header.roles"),
    getFormatter(),
    getCurrentAdmin(),
  ]);

  const roles = format.list(
    admin.roles.map((role) => (tRoles.has(role) ? tRoles(role) : role)),
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldOff className="size-5 text-destructive" aria-hidden />
        </div>

        <h1 className="text-lg font-bold text-foreground">
          <ForbiddenSection />
        </h1>

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {t("description", { role: roles || t("unknownRole") })}
        </p>

        <Link
          href="/"
          className="mt-1 rounded-lg bg-secondary px-4 py-2 text-[13px] font-semibold text-card transition-opacity hover:opacity-90"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
