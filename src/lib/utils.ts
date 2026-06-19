/** Merge class names, filtering out falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Resolve display names from an array of IDs against a lookup list. */
export function namesFromIds<T extends { id: string; name: string }>(
  ids: string[],
  source: T[]
): string[] {
  return ids
    .map((id) => source.find((item) => item.id === id)?.name)
    .filter((name): name is string => name !== undefined);
}

/** Return items that appear in both arrays. */
export function overlap<T>(first: T[], second: T[]): T[] {
  return first.filter((item) => second.includes(item));
}

/** Deduplicate and remove falsy values from an array. */
export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items.filter(Boolean)));
}

/** Split a comma-separated string into a trimmed, non-empty list. */
export function listFromText(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Convert a string to a URL-safe slug. */
export function slugify(value = "item"): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "item"
  );
}

/** Generate a short, time-based unique ID with a readable prefix. */
export function makeId(prefix: string, label: string): string {
  return `${prefix}-${slugify(label)}-${Date.now().toString(36)}`;
}

/** Basic email format check (not exhaustive — just catches obvious typos). */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
