"use server";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { CategoryDetail } from "@/types/categories";
import type { ApiResponse } from "@/types/shared";

// One category with its types and listing fields. A Server Action so the
// open row can load it on demand without the token leaving the server
export async function getCategory(
  id: number,
): Promise<ActionResult<CategoryDetail>> {
  return runAction(async () => {
    const response = await api.get<ApiResponse<CategoryDetail>>(
      `/api/v1/admin/catalog/categories/${id}`,
    );
    return response.data;
  });
}
