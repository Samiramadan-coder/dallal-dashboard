export type Locale = "en" | "ar";

export type T = (key: string) => string;

export type Pagination = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

// Envelope every Laravel API response comes in
export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};
