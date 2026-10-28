// The list is an array of entries: { id, name, addedAt }.
// Every function returns a new list and leaves its input untouched.

export function contains(list, item) {
  return list.some((entry) => entry.id === item.id);
}

export function add(list, item) {
  if (contains(list, item)) return list;
  return [...list, { id: item.id, name: item.name, addedAt: new Date().toISOString() }];
}

export function remove(list, item) {
  return list.filter((entry) => entry.id !== item.id);
}

export function toggle(list, item) {
  return contains(list, item) ? remove(list, item) : add(list, item);
}

export function merge(list, incoming) {
  const known = new Set(list.map((entry) => entry.id));
  const unique = new Map(incoming.filter((entry) => !known.has(entry.id)).map((entry) => [entry.id, entry]));
  return [...list, ...unique.values()];
}

// Points entries at the current catalog ids. Unknown entries are kept, so no data is lost.
export function reconcile(list, findItem) {
  return list.map((entry) => {
    const item = findItem(entry);
    return item ? { ...entry, id: item.id, name: item.name } : entry;
  });
}

export function resolve(list, findItem) {
  return list.map(findItem).filter(Boolean);
}

export function sanitize(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(isEntry);
}

function isEntry(entry) {
  return typeof entry?.id === 'string' && typeof entry?.name === 'string';
}
