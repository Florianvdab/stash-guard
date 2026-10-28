export const ALL = 'all';
export const QUALITIES = ['legendary', 'set', 'gem'];

export function countByQuality(items) {
  const counts = Object.fromEntries([ALL, ...QUALITIES].map((quality) => [quality, 0]));
  for (const item of items) {
    counts[ALL]++;
    counts[item.quality]++;
  }
  return counts;
}

export function hasQuality(filter) {
  return (item) => filter === ALL || item.quality === filter;
}
