import { sanitize } from './my-list.js';

const FORMAT = 'stash-guard';
const VERSION = 1;

export function toBackup(list, now = new Date()) {
  return {
    filename: `stash-guard-${now.toISOString().slice(0, 10)}.json`,
    content: JSON.stringify({ format: FORMAT, version: VERSION, exportedAt: now.toISOString(), items: list }, null, 2),
  };
}

export function parseBackup(text) {
  const data = parseJson(text);
  if (data?.format !== FORMAT || !Array.isArray(data.items)) {
    throw new Error('This is not a Stash Guard backup file.');
  }
  return sanitize(data.items);
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
