function getAssetBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) {
    return "/placeholder-avatar.svg";
  }

  const assetBaseUrl = getAssetBaseUrl();

  if (url.startsWith("http://localhost:5000/uploads/")) {
    return url.replace("http://localhost:5000", assetBaseUrl);
  }

  if (url.startsWith("https://localhost:5000/uploads/")) {
    return url.replace("https://localhost:5000", assetBaseUrl);
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${assetBaseUrl}${url}`;
  }

  return `${assetBaseUrl}/${url}`;
}