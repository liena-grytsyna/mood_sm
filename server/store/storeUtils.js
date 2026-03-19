export function createId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeLower(value) {
  return normalizeText(value).toLowerCase();
}

export function parseStoredJson(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function sortByNewest(items, dateKey) {
  return [...items].sort((left, right) => new Date(right[dateKey]) - new Date(left[dateKey]));
}
