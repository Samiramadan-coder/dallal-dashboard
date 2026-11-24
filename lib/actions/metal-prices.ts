"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { ManualPricePayload } from "@/types/metal-prices";
import type { ApiResponse } from "@/types/shared";

// Replaces the feed price of one grade in one country by hand
export async function setManualPrice(
  payload: ManualPricePayload,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/admin/prices/override",
      payload,
    );

    updateTag("metal-prices");
    // Sources list each country's active overrides
    updateTag("metal-sources");

    return { message: response.message ?? undefined };
  });
}
