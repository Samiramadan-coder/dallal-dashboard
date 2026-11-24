import "server-only";

import { api } from "@/lib/api/client";
import type { BannedWord } from "@/types/categories";
import type { ApiResponse } from "@/types/shared";

// Every banned keyword, in both languages
export async function getBannedWords() {
  const response = await api.get<ApiResponse<BannedWord[]>>(
    "/api/v1/admin/catalog/banned-words",
    { next: { tags: ["banned-words"] } },
  );

  return response.data;
}
