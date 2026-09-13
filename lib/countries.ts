import { CountryFormValues } from "@/types/countries";
import { http, ValidationError } from "./http";

type PostCountryResult =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      message?: string;
      errors?: Partial<Record<keyof CountryFormValues, string>>;
    };

export async function postCountry(
  countryData: CountryFormValues,
  id?: number,
): Promise<PostCountryResult> {
  const method = id ? "put" : "post";
  const url = id ? `/api/v1/admin/countries/${id}` : "/api/v1/admin/countries";

  const formData = new FormData();

  formData.append("name[en]", countryData.name.en);
  formData.append("name[ar]", countryData.name.ar);

  formData.append("code", countryData.code);
  formData.append("flag", countryData.flag);

  formData.append("is_active", countryData.is_active ? "1" : "0");

  try {
    const { data } = await http[method]<{ message: string }>(url, formData);
    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      const errors = Object.fromEntries(
        Object.entries(error.errors).map(([field, messages]) => [
          field,
          messages[0] ?? "Invalid value",
        ]),
      ) as Partial<Record<keyof CountryFormValues, string>>;
      return { success: false, errors, message: error.message };
    }
    return { success: false };
  }
}

// Function to delete a country by ID
type DeleteCountryResult =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      message?: string;
    };

export async function deleteCountry(id: number): Promise<DeleteCountryResult> {
  try {
    const { data } = await http.delete<{ message: string }>(
      `/api/v1/admin/countries/${id}`,
    );
    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      return { success: false, message: error.message };
    }

    return { success: false };
  }
}
