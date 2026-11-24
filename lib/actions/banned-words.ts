"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/shared";

// Bans a word in one country, or everywhere when countryId is null. The
// list refreshes through its tag
export async function createBannedWord(payload: {
  word: string;
  country_id: number | null;
}): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/admin/catalog/banned-words",
      payload,
    );

    updateTag("banned-words");

    return { message: response.message ?? undefined };
  });
}

export async function deleteBannedWord(
  id: number,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.delete<ApiResponse<unknown> | undefined>(
      `/api/v1/admin/catalog/banned-words/${id}`,
    );

    updateTag("banned-words");

    return { message: response?.message ?? undefined };
  });
}

// Checks a title the way the backend checks listings: whether it would go
// to review, and which banned words caused it. Changes nothing
export async function testBannedWords(
  text: string,
): Promise<ActionResult<{ triggers_review: boolean; words: string[] }>> {
  return runAction(async () => {
    const response = await api.post<
      ApiResponse<{ triggers_review: boolean; words: string[] }>
    >("/api/v1/admin/catalog/banned-words/test", { text });

    return response.data;
  });
}
