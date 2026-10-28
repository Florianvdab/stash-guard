import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mapConcurrently } from './concurrency.js';

// Blizzard's icon CDN only answers over http, so a https site can't hotlink it.
// The akamai mirror serves the same files over https and acts as fallback.
const DOWNLOAD_TIMEOUT_MS = 15_000;
const ICON_SOURCES = [
  (icon) => `http://media.blizzard.com/d3/icons/items/large/${icon}.png`,
  (icon) => `https://blzmedia-a.akamaihd.net/d3/icons/items/large/${icon}.png`,
];

export async function downloadIcons(iconNames, directory) {
  await mkdir(directory, { recursive: true });
  const found = await mapConcurrently(iconNames, 10, (icon) => ensureIcon(icon, directory));
  return new Set(iconNames.filter((_, index) => !found[index]));
}

async function ensureIcon(icon, directory) {
  const file = join(directory, `${icon}.png`);
  if (await exists(file)) return true;

  for (const source of ICON_SOURCES) {
    const image = await fetchImage(source(icon));
    if (image) {
      await writeFile(file, image);
      return true;
    }
  }
  return false;
}

async function fetchImage(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
    const isImage = response.headers.get('content-type')?.startsWith('image/');
    return response.ok && isImage ? Buffer.from(await response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
