import "server-only";

import { cache } from "react";

import type { SidebarCounts } from "@/types/dashboard-layout";

// Numbers shown next to sidebar links, keyed by the link's `key` in
// constants/dashboard-layout (e.g. { listings: 12, reports: 3 }).
// No API for them yet; return them here once there is one
export const getSidebarCounts = cache(async (): Promise<SidebarCounts> => {
  return {};
});
