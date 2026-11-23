import { getFormatter, getTranslations } from "next-intl/server";

import { getAdminCountries, getCurrentAdmin } from "@/lib/admin";
import PageHeader, { HeaderSelect } from "@/components/reusable/page-header";
import PagePlaceholder from "@/components/reusable/page-placeholder";

const PERIODS = [7, 30, 90];

export default async function Home() {
  const [t, format, admin] = await Promise.all([
    getTranslations("pageHeaders"),
    getFormatter(),
    getCurrentAdmin(),
  ]);
  const countries = await getAdminCountries(admin);

  return (
    <>
      <PageHeader
        page="overview"
        subtitle={format.dateTime(new Date(), {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        actions={
          <>
            <HeaderSelect
              label={t("filters.country")}
              defaultValue="all"
              options={[
                { value: "all", label: t("filters.allCountries") },
                ...countries.map((country) => ({
                  value: country.code,
                  label: t("filters.countryName", {
                    en: country.name.en,
                    ar: country.name.ar,
                  }),
                })),
              ]}
            />
            <HeaderSelect
              label={t("filters.period")}
              defaultValue="30"
              options={PERIODS.map((days) => ({
                value: String(days),
                label: t("filters.lastDays", { days }),
              }))}
            />
          </>
        }
      />
      <PagePlaceholder href="/" />
    </>
  );
}
