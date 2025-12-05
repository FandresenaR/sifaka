/**
 * API Client avec authentification OAuth
 * Ajoute automatiquement le token JWT à chaque requête
 */

import { getToken } from "./oauth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Effectue une requête HTTP avec le token d'authentification
 */
async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Ajoute les paramètres de requête
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryString.append(key, String(value));
    });
    url += `?${queryString.toString()}`;
  }

  // Ajoute le header Authorization
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.statusText}`);
  }

  // Retourne la réponse JSON si possible
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response as any;
}

/**
 * GET request
 */
export async function get<T = any>(
  endpoint: string,
  options?: Omit<RequestOptions, "method">
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request
 */
export async function post<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request
 */
export async function patch<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T = any>(
  endpoint: string,
  options?: Omit<RequestOptions, "method">
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "DELETE" });
}

export default {
  request,
  get,
  post,
  put,
  patch,
  del,
};
