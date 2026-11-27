"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { CreateRolePayload, Role, UpdateRolePayload } from "@/types/roles";
import type { ApiResponse } from "@/types/shared";

// Creates a role with its permissions (at least one).
// Returns the new role so the page can select it
export async function createRole(
  payload: CreateRolePayload,
): Promise<ActionResult<{ role: Role; message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<Role>>(
      "/api/v1/admin/roles",
      payload,
    );

    // The roles page reads this tag; the next render gets the new role
    updateTag("roles");

    return { role: response.data, message: response.message ?? undefined };
  });
}

// Replaces a custom role's permissions (at least one). System roles are
// read-only and the API rejects them
export async function updateRole(
  id: number,
  payload: UpdateRolePayload,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.put<ApiResponse<unknown>>(
      `/api/v1/admin/roles/${id}`,
      payload,
    );

    updateTag("roles");

    return { message: response.message ?? undefined };
  });
}

// Deletes a custom role. System roles can't be deleted
export async function deleteRole(
  id: number,
  // Why it was deleted, for the audit log
  reason: string,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.delete<ApiResponse<unknown> | undefined>(
      `/api/v1/admin/roles/${id}`,
      { reason },
    );

    updateTag("roles");

    return { message: response?.message ?? undefined };
  });
}
