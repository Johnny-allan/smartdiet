export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export type ApiResponse<T> = {
  data: T | null;
  meta: Record<string, unknown>;
  errors: Array<Record<string, unknown>>;
};

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`SmartDiet API error: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function apiPost<TResponse, TPayload = unknown>(
  path: string,
  payload: TPayload,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`SmartDiet API error: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<TResponse>>;
}

export async function apiPut<TResponse, TPayload = unknown>(
  path: string,
  payload: TPayload,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`SmartDiet API error: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<TResponse>>;
}

export async function apiPatch<TResponse, TPayload = unknown>(
  path: string,
  payload: TPayload,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(`SmartDiet API error: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<TResponse>>;
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`SmartDiet API error: ${response.status}`);
  }
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(`SmartDiet API error: ${response.status}`);
  }

  return response.blob();
}

export function requireApiData<T>(response: ApiResponse<T>): T {
  if (response.data === null) {
    throw new Error("SmartDiet API response without data");
  }
  return response.data;
}
