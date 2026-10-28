// Builds data/items.json and icons/ from the Blizzard Diablo 3 Game Data API.
// Run with `npm run fetch-items`; re-run when a new season adds items.
// The client secret stays in .env: the website only ever reads data/items.json.

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createBlizzardClient } from './lib/blizzard-client.js';
import { mapConcurrently } from './lib/concurrency.js';
import { createDiskCache } from './lib/disk-cache.js';
import { downloadIcons } from './lib/icons.js';
import { isGearType, isLiveItem, keepNewestPerName, toEntry } from './lib/item-rules.js';

const ROOT = join(import.meta.dirname, '..');

const client = await createBlizzardClient(readCredentials());
const cached = await createDiskCache(join(ROOT, '.cache'));

const listedItems = await fetchLiveItems();
console.log(`${listedItems.length} items listed, fetching details…`);

const failed = [];
const details = await mapConcurrently(listedItems, 10, fetchDetail);
const entries = keepNewestPerName(details.map(toEntry).filter(Boolean));

const missingIcons = await downloadIcons(entries.map((entry) => entry.icon), join(ROOT, 'icons'));
const items = entries.map((entry) => (missingIcons.has(entry.icon) ? { ...entry, icon: null } : entry));

await writeFile(join(ROOT, 'data', 'items.json'), JSON.stringify({ generated: new Date().toISOString(), items }));
report(items);

function readCredentials() {
  try {
    process.loadEnvFile(join(ROOT, '.env'));
  } catch {
    // No .env file: fall back to variables already in the environment.
  }
  const clientId = process.env.BLIZZARD_CLIENT_ID ?? process.env.CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET ?? process.env.CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Set CLIENT_ID and CLIENT_SECRET in .env');
  return { clientId, clientSecret };
}

async function fetchLiveItems() {
  const itemTypes = (await client.get('item-type')).filter(isGearType);
  const lists = await mapConcurrently(itemTypes, 8, (itemType) => client.get(itemType.path));
  const live = lists.flat().filter((item) => item && isLiveItem(item));
  return [...new Map(live.map((item) => [item.id, item])).values()];
}

async function fetchDetail(listedItem) {
  try {
    return await cached(listedItem.path, () => client.get(listedItem.path));
  } catch {
    failed.push(listedItem.name);
    return null;
  }
}

function report(items) {
  const counts = Object.groupBy(items, (item) => item.quality);
  const summary = Object.entries(counts).map(([quality, group]) => `${group.length} ${quality}`);
  const withoutIcon = items.filter((item) => !item.icon).map((item) => item.name);

  console.log(`items.json: ${items.length} items (${summary.join(', ')})`);
  if (withoutIcon.length) console.log(`No icon on the CDN for: ${withoutIcon.join(', ')}`);
  if (failed.length) console.log(`The API failed for ${failed.length} items, skipped: ${failed.join(', ')}`);
}
