import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseBackup, toBackup } from '../js/backup.js';

const list = [{ id: 'ring', name: 'Stone of Jordan', addedAt: '2026-10-28T00:00:00.000Z' }];

describe('backup', () => {
  it('round-trips a list', () => {
    assert.deepEqual(parseBackup(toBackup(list).content), list);
  });

  it('names the file after the export date', () => {
    assert.equal(toBackup(list, new Date('2026-10-28T12:00:00Z')).filename, 'stash-guard-2026-10-28.json');
  });

  it('rejects files that are not JSON', () => {
    assert.throws(() => parseBackup('not json'), /not a Stash Guard backup/);
  });

  it('rejects JSON from another app', () => {
    assert.throws(() => parseBackup('{"items": []}'), /not a Stash Guard backup/);
  });

  it('drops malformed entries', () => {
    const content = JSON.stringify({ format: 'stash-guard', version: 1, items: [...list, { id: 5 }] });
    assert.deepEqual(parseBackup(content), list);
  });
});
