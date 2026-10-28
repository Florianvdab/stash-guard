import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { add, contains, merge, reconcile, remove, resolve, sanitize, toggle } from '../js/my-list.js';

const ring = { id: 'ring', name: 'Stone of Jordan' };
const helm = { id: 'helm', name: 'Andariel’s Visage' };
const entry = (item) => ({ id: item.id, name: item.name, addedAt: '2026-10-28T00:00:00.000Z' });

describe('add / remove / toggle', () => {
  it('adds an item once', () => {
    const list = add(add([], ring), ring);
    assert.equal(list.length, 1);
    assert.ok(contains(list, ring));
  });

  it('removes an item', () => {
    assert.deepEqual(remove([entry(ring), entry(helm)], ring), [entry(helm)]);
  });

  it('toggles an item on and off', () => {
    const list = toggle([], ring);
    assert.ok(contains(list, ring));
    assert.equal(toggle(list, ring).length, 0);
  });

  it('never changes the list it was given', () => {
    const list = Object.freeze([entry(ring)]);
    assert.doesNotThrow(() => add(remove(list, ring), helm));
  });
});

describe('merge', () => {
  it('adds only entries that are not on the list yet', () => {
    const merged = merge([entry(ring)], [entry(ring), entry(helm), entry(helm)]);
    assert.deepEqual(merged.map((item) => item.id), ['ring', 'helm']);
  });
});

describe('reconcile / resolve', () => {
  const catalog = new Map([['Stone of Jordan', { id: 'ring-v2', name: 'Stone of Jordan' }]]);
  const findItem = (listed) => catalog.get(listed.name);

  it('moves entries to the current catalog id and keeps unknown ones', () => {
    const unknown = { id: 'gone', name: 'Removed Item' };
    assert.deepEqual(reconcile([entry(ring), unknown], findItem).map((item) => item.id), ['ring-v2', 'gone']);
  });

  it('resolves only entries the catalog knows', () => {
    assert.deepEqual(resolve([entry(ring), entry(helm)], findItem), [{ id: 'ring-v2', name: 'Stone of Jordan' }]);
  });
});

describe('sanitize', () => {
  it('drops anything that is not a list entry', () => {
    assert.deepEqual(sanitize([entry(ring), null, { id: 1 }, 'x']), [entry(ring)]);
  });

  it('returns an empty list for non-arrays', () => {
    assert.deepEqual(sanitize(null), []);
  });
});
