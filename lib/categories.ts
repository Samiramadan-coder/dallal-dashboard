import "server-only";

import { api } from "@/lib/api/client";
import type { Category } from "@/types/categories";
import type { ApiResponse } from "@/types/shared";

// Every category, both audiences, unpaginated
export async function getCategories() {
  const response = await api.get<ApiResponse<Category[]>>(
    "/api/v1/admin/catalog/categories",
    { next: { tags: ["categories"] } },
  );

  return [...response.data].sort((a, b) => a.sort - b.sort);
}
