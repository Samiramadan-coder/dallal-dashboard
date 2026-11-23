"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { CreateAdminPayload, UpdateAdminPayload } from "@/types/roles";
import type { ApiResponse } from "@/types/shared";

// Creates an admin account with its roles and countries
export async function createAdmin(
  payload: CreateAdminPayload,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/admin/admins",
      payload,
    );

    updateTag("admins");
    // Role cards show how many admins each role has
    updateTag("roles");

    return { message: response.message ?? undefined };
  });
}

// Turns an admin account on or off, with the reason for the audit log
export async function updateAdmin(
  id: number,
  payload: UpdateAdminPayload,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.put<ApiResponse<unknown>>(
      `/api/v1/admin/admins/${id}`,
      payload,
    );

    updateTag("admins");

    return { message: response.message ?? undefined };
  });
}

// Deletes an admin account
export async function deleteAdmin(
  id: number,
): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.delete<ApiResponse<unknown> | undefined>(
      `/api/v1/admin/admins/${id}`,
    );

    updateTag("admins");
    updateTag("roles");

    return { message: response?.message ?? undefined };
  });
}
