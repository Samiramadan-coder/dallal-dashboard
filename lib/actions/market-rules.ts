"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/shared";

export type MarketRulePayload = {
  category_id: number;
  country_id: number;
  // null for no cap
  max_price_individual: number | null;
  requires_review: boolean;
};

// Sets one category's rule in one country. The form sends one per changed
// box, then calls refreshMarketRules once
export async function updateMarketRule(
  payload: MarketRulePayload,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.put<ApiResponse<unknown>>(
      "/api/v1/admin/catalog/market-rules",
      payload,
    );

    return { message: response.message ?? undefined };
  });
}

// Refetches the rules after a batch of updates, instead of once per request
export async function refreshMarketRules(): Promise<void> {
  updateTag("market-rules");
}
