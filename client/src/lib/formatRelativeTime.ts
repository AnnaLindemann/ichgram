export function formatRelativeTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs <= 0) {
    return "now";
  }

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
    return `${minutes}m`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours}h`;
  }

  if (diffMs < weekMs) {
    const days = Math.floor(diffMs / dayMs);
    return `${days}d`;
  }

  const weeks = Math.floor(diffMs / weekMs);
  return `${weeks}w`;
}