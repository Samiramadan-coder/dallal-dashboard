// Colour of a status pill (components/reusable/status-badge), so the same
// state looks the same in every module. Tones map to palette tokens only:
//   success → secondary (green), warning → primary (gold),
//   danger → destructive, neutral → muted
export type StatusTone = "success" | "warning" | "danger" | "neutral";

// Every status the API sends that the dashboard shows. Labels live in
// messages → Common.status; a status missing here renders neutral with its
// raw value humanized, so add new ones as modules land
export const STATUS_TONES = {
  // Admins, cities, countries (is_active)
  active: "success",
  inactive: "neutral",
  // Countries (status)
  live: "success",
  coming_soon: "warning",
  // Metal prices
  published: "success",
  pending: "warning",
  rejected: "danger",
  superseded: "neutral",
  // Metal prices market summary
  open: "success",
  closed: "neutral",
  delayed: "warning",
} as const satisfies Record<string, StatusTone>;

export type KnownStatus = keyof typeof STATUS_TONES;
