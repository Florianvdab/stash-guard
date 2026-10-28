// Decides which API items end up in items.json and in what shape.

const NON_GEAR_TYPES = /^(craftingplan|craftingreagent|dye|demonickey|healthpotion|gold|quest|scroll|portaldevice|generalutility|trainingtome|gem$|mystery)/;

export function isGearType(itemType) {
  const slug = itemType.path.split('/')[1];
  return !NON_GEAR_TYPES.test(slug);
}

// Ids don't reveal quality (follower legendaries and Necromancer sets lack "Unique"),
// so every live item is fetched and judged by its colour.
export function isLiveItem(listedItem) {
  return !/_PTR$/i.test(listedItem.id);
}

export function qualityOf(detail) {
  if (detail.type?.id === 'UpgradeableJewel') return 'gem';
  if (detail.color === 'green') return 'set';
  if (detail.color === 'orange') return 'legendary';
  return null;
}

export function toEntry(detail) {
  const quality = detail?.name ? qualityOf(detail) : null;
  if (!quality) return null;

  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    quality,
    type: detail.typeName,
    ...slotAndSet(detail),
    icon: detail.icon,
  };
}

function slotAndSet(detail) {
  const slot = detail.slots?.[0] ?? null;
  return detail.setName ? { slot, set: detail.setName } : { slot };
}

// The API also lists older copies of an item (Unique_Ring_109_x1 next to _p2).
// Keep one per name, preferring the newest patch id: that's the one that drops today.
export function keepNewestPerName(entries) {
  const newest = new Map();
  for (const entry of entries) {
    const key = `${entry.quality}:${entry.name}`;
    const current = newest.get(key);
    if (!current || patchNumber(entry.id) > patchNumber(current.id)) newest.set(key, entry);
  }
  return [...newest.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function patchNumber(id) {
  const match = id.match(/^P(\d+)_|_p(\d+)$/i);
  return match ? Number(match[1] ?? match[2]) : 0;
}
