const MAX_RESULTS = 40;

export function createCatalog(items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const byName = new Map(items.map((item) => [item.name, item]));
  const index = items.map((item) => ({ item, text: normalize(`${item.name} ${item.set ?? ''}`) }));

  return {
    // Falls back to the name, because ids can change when items.json is regenerated.
    find: (entry) => byId.get(entry.id) ?? byName.get(entry.name),
    search: (query) => search(index, query),
  };
}

function search(index, query) {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];

  const phrase = words.join(' ');
  const matches = index.filter(({ text }) => words.every((word) => text.includes(word)));
  const startsWithPhrase = ({ text }) => (text.startsWith(phrase) ? 0 : 1);

  return matches
    .sort((a, b) => startsWithPhrase(a) - startsWithPhrase(b))
    .slice(0, MAX_RESULTS)
    .map(({ item }) => item);
}

export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ'’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
