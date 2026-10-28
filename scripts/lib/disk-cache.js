import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function createDiskCache(directory) {
  await mkdir(directory, { recursive: true });

  return async function cached(key, produce) {
    const file = join(directory, `${key.replace(/[^\w-]/g, '_')}.json`);
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch {
      const value = await produce();
      if (value !== null) await writeFile(file, JSON.stringify(value)); // a 404 may be temporary
      return value;
    }
  };
}
