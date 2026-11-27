"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { City } from "@/types/countries";
import { Locale } from "@/types/shared";
import { getCountryCities, updateCity } from "@/lib/actions/cities";
import CreateEditCity from "./create-edit-city";
import type { LocationValue } from "../form/location-picker";
import EditBtn from "../reusable/edit-btn";
import StatusBadge from "../reusable/status-badge";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; cities: City[] };


// Where the city map opens for a country with no cities yet (Dubai)
const FALLBACK_MAP_CENTER: LocationValue = {
  latitude: 25.2048,
  longitude: 55.2708,
};

// Cities of one country, shown under its row. The list lives in local state
// so adding, editing or deleting a city updates it without refetching the
// countries table
export default function CitiesPanel({
  countryId,
  // Known from the table row; sizes the skeleton to the real list
  expectedCount = 3,
  canEdit,
}: {
  countryId: number;
  expectedCount?: number;
  // Cities belong to the country, so changing them needs countries.edit
  canEdit: boolean;
}) {
  const t = useTranslations("Countries.Cities");
  const tCommon = useTranslations("Common");
  const [state, setState] = useState<State>({ status: "loading" });
  // Bumped to rerun the fetch: "Try again", or after adding a city when the
  // API didn't send it back
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getCountryCities(countryId).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: "ready", cities: result.data }
          : { status: "error" },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [countryId, attempt]);

  // Functional updates: a switch toggle and its revert can overlap with
  // other rows' changes
  function updateCities(change: (cities: City[]) => City[]) {
    setState((current) =>
      current.status === "ready"
        ? { status: "ready", cities: change(current.cities) }
        : current,
    );
  }

  function replaceCity(city: City) {
    updateCities((cities) => cities.map((c) => (c.id === city.id ? city : c)));
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="flex items-center gap-3">
        <p className="text-xs text-destructive">{t("loadFailed")}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((n) => n + 1);
          }}
        >
          <RotateCw />
          {tCommon("TryAgain")}
        </Button>
      </div>
    );
  }

  const cities = state.status === "ready" ? state.cities : [];
  const mapCenter: LocationValue = cities[0]
    ? { latitude: Number(cities[0].lat), longitude: Number(cities[0].lng) }
    : FALLBACK_MAP_CENTER;

  const columns = [
    t("Table.name"),
    t("Table.coordinates"),
    t("Table.status"),
    ...(canEdit ? [t("Table.actions")] : []),
  ];

  return (
    <div className="space-y-3">
      {canEdit && state.status === "ready" && (
        <div className="flex justify-end">
          <CreateEditCity
            countryId={countryId}
            mapCenter={mapCenter}
            onSaved={(city) => {
              if (city) {
                updateCities((current) => [...current, city]);
              } else {
                // Keeps the current rows on screen while the list reloads
                setAttempt((n) => n + 1);
              }
            }}
          />
        </div>
      )}

      {state.status === "ready" && cities.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table className="[&_td]:py-2.5!">
            <TableHeader className="bg-muted/60">
              <TableRow className="border-border/60 hover:bg-transparent">
                {columns.map((label) => (
                  <TableHead
                    key={label}
                    className="h-8 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase"
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {state.status === "loading"
                ? Array.from({
                    length: Math.min(Math.max(expectedCount, 1), 8),
                  }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell>
                        <Skeleton className="h-3.5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14 rounded-full" />
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Skeleton className="size-6" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                : cities.map((city) => (
                    <CityRow
                      key={city.id}
                      city={city}
                      countryId={countryId}
                      canEdit={canEdit}
                      onChange={replaceCity}
                    />
                  ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function CityRow({
  city,
  countryId,
  canEdit,
  onChange,
}: {
  city: City;
  countryId: number;
  canEdit: boolean;
  onChange: (city: City) => void;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Countries.Cities");
  const tCommon = useTranslations("Common");
  const [toggling, setToggling] = useState(false);

  // Flips at once, then rolls back if the API refuses
  async function toggleActive(isActive: boolean) {
    setToggling(true);
    onChange({ ...city, is_active: isActive });

    const result = await updateCity(city.id, { is_active: isActive });
    setToggling(false);

    if (!result.ok) {
      onChange(city);
      toast.error(result.message || tCommon("UpdateFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("UpdatedSuccessfully"));
  }

  const statusLabel = city.is_active ? t("active") : t("inactive");

  return (
    <TableRow>
      <TableCell>
        <span className="font-semibold text-foreground">
          {city.name[locale]}
        </span>
      </TableCell>
      <TableCell dir="ltr" className="text-start tabular-nums">
        {/* Number(): some Laravel responses send decimals as strings */}
        {Number(city.lat).toFixed(4)}, {Number(city.lng).toFixed(4)}
      </TableCell>
      <TableCell>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={city.is_active}
              disabled={toggling}
              onCheckedChange={toggleActive}
              aria-label={`${city.name[locale]}: ${statusLabel}`}
            />
            <span className="text-xs text-muted-foreground">{statusLabel}</span>
          </div>
        ) : (
          <StatusBadge
            status={city.is_active ? "active" : "inactive"}
            label={statusLabel}
          />
        )}
      </TableCell>
      {canEdit && (
        <TableCell className="py-1.5!">
          <CreateEditCity
            countryId={countryId}
            city={city}
            mapCenter={{
              latitude: Number(city.lat),
              longitude: Number(city.lng),
            }}
            trigger={<EditBtn />}
            onSaved={(saved) => saved && onChange(saved)}
          />
        </TableCell>
      )}
    </TableRow>
  );
}
