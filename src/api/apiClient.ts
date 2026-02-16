import axios from "axios";

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]> | string[];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5242/api"
});

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan."
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | string | undefined;

    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }

      if (Array.isArray(data.errors)) {
        const message = data.errors.filter(Boolean).join(", ");
        if (message) return message;
      }

      if (data.errors && typeof data.errors === "object") {
        const message = Object.values(data.errors)
          .flat()
          .filter(Boolean)
          .join(", ");
        if (message) return message;
      }
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default api;