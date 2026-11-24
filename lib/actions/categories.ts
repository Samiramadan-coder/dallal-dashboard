"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type {
  CategoryDetail,
  CategoryType,
  CreateCategoryValues,
  CreateFieldPayload,
  Translated,
} from "@/types/categories";
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

// Updates a category's own data (names, icon, sort order, pricing mode,
// image). Takes FormData since the image is a file; the form builds it with
// toFormData. Its listing fields are saved separately
export async function updateCategory(
  id: number,
  formData: FormData,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    // PHP only parses multipart bodies on POST, so a real PUT would arrive
    // without the image. Laravel reads `_method` and routes it as PUT
    formData.set("_method", "PUT");

    const response = await api.post<ApiResponse<unknown>>(
      `/api/v1/admin/catalog/categories/${id}`,
      formData,
    );

    // The categories list shows the name and sort order
    updateTag("categories");

    return { message: response.message ?? undefined };
  });
}

// Adds a type to a category. Returns the new type when the API sends it
// back, so the form can keep its id
export async function createCategoryType(
  categoryId: number,
  payload: { key: string; name: Translated },
): Promise<ActionResult<{ type?: CategoryType; message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<CategoryType | null>>(
      `/api/v1/admin/catalog/categories/${categoryId}/types`,
      payload,
    );

    // The categories list shows each category's type count
    updateTag("categories");

    return {
      type: response.data?.id ? response.data : undefined,
      message: response.message ?? undefined,
    };
  });
}


// Adds a listing field to a category
export async function createCategoryField(
  payload: CreateFieldPayload,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/admin/catalog/fields",
      payload,
    );

    // The categories list shows each category's field count
    updateTag("categories");

    return { message: response.message ?? undefined };
  });
}

// Adds a category; the list refreshes through its tag
export async function createCategory(
  payload: CreateCategoryValues,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/admin/catalog/categories",
      payload,
    );

    updateTag("categories");

    return { message: response.message ?? undefined };
  });
}
