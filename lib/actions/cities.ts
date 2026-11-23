"use server";

import { updateTag } from "next/cache";

import { api } from "@/lib/api/client";
import { runAction, type ActionResult } from "@/lib/api/errors";
import type { City, CityFormValues } from "@/types/countries";
import type { ApiResponse } from "@/types/shared";

// Every city of a country; the API doesn't paginate them. A Server Action
// so the open row can load it on demand without the token leaving the server
export async function getCountryCities(
  countryId: number,
): Promise<ActionResult<City[]>> {
  return runAction(async () => {
    const response = await api.get<ApiResponse<City[]>>(
      `/api/v1/admin/countries/${countryId}/cities`,
    );
    return response.data;
  });
}

// Adds a city to a country. Returns the new city when the API sends it back,
// so the open cities table can show it without another request
export async function createCity(
  countryId: number,
  payload: CityFormValues,
): Promise<ActionResult<{ city?: City; message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<City | null>>(
      `/api/v1/admin/countries/${countryId}/cities`,
      payload,
    );

    // The countries table shows each country's city count
    updateTag("countries");

    return {
      city: response.data?.id ? response.data : undefined,
      message: response.message ?? undefined,
    };
  });
}

// Updates a city. The API takes partial bodies, e.g. { is_active: false }
// from the status switch, or the whole form from the edit dialog
export async function updateCity(
  id: number,
  payload: Partial<CityFormValues>,
): Promise<ActionResult<{ city?: City; message?: string }>> {
  return runAction(async () => {
    const response = await api.put<ApiResponse<City | null>>(
      `/api/v1/admin/cities/${id}`,
      payload,
    );

    return {
      city: response.data?.id ? response.data : undefined,
      message: response.message ?? undefined,
    };
  });
}
