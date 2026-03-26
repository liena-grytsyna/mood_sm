// make unique id 
export function createId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// normalize text value
export function normalizeText(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

//convert to lovercasee 
export function normalizeLower(value) {
  return normalizeText(value).toLowerCase();
}
// send json response
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

//sort items by date key, newest first
export function sortByNewest(items, dateKey) {
  return items.sort(function (a, b) {
    return new Date(b[dateKey]) - new Date(a[dateKey]);
  });
}