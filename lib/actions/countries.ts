"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/shared";

// Creates a country, or updates it when `id` is given. Takes FormData since
// the flag is a file; the form builds it with toFormData
export async function saveCountry(
  formData: FormData,
  id?: number,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = id
      ? await api.put<ApiResponse<unknown>>(
          `/api/v1/admin/countries/${id}`,
          formData,
        )
      : await api.post<ApiResponse<unknown>>(
          "/api/v1/admin/countries",
          formData,
        );

    updateTag("countries");

    return { message: response.message ?? undefined };
  });
}

export async function deleteCountry(
  id: number,
  // Why it was deleted, for the audit log
  reason: string,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.delete<ApiResponse<unknown> | undefined>(
      `/api/v1/admin/countries/${id}`,
      { reason },
    );

    updateTag("countries");

    return { message: response?.message ?? undefined };
  });
}
