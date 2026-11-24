import "server-only";

import { api } from "@/lib/api/client";
import type { MarketRule } from "@/types/categories";
import type { ApiResponse } from "@/types/shared";

// Every individual-market rule (price cap and review) per category and country
export async function getMarketRules() {
  const response = await api.get<ApiResponse<MarketRule[]>>(
    "/api/v1/admin/catalog/market-rules",
    { next: { tags: ["market-rules"] } },
  );

  return response.data;
}
