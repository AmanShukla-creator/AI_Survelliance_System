// Centralized API URL helper.
//
// - In dev, Vite proxy handles relative "/api" calls, so VITE_API_BASE_URL can be empty.
// - In prod, set VITE_API_BASE_URL to your deployed backend, e.g. https://ai-survelliance-system-4.onrender.com

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

export function apiUrl(pathname) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  // If API_BASE_URL is empty, keep relative URLs (works with Vite dev proxy).
  if (!API_BASE_URL) return path;

  return `${API_BASE_URL}${path}`;
}
