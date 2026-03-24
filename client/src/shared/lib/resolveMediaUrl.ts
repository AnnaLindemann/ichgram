/**
 * Converts a relative media URL returned by the backend (e.g. "/uploads/photo.jpg")
 * into an absolute URL by prepending VITE_API_URL.
 * Absolute URLs (http/https) are returned unchanged.
 */
export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${apiUrl}${url}`;
  }

  return `${apiUrl}/${url}`;
}
