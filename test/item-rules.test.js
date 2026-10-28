import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isGearType, isLiveItem, keepNewestPerName, patchNumber, toEntry } from '../scripts/lib/item-rules.js';

const detail = (overrides) => ({
  id: 'Unique_Ring_013_x1',
  slug: 'the-compass-rose',
  name: 'The Compass Rose',
  icon: 'unique_ring_013_x1_demonhunter_male',
  typeName: 'Set Ring',
  type: { id: 'Ring' },
  color: 'green',
  slots: ['left-finger', 'right-finger'],
  setName: 'Endless Walk',
  ...overrides,
});

describe('filters', () => {
  it('skips item types that are not gear', () => {
    assert.equal(isGearType({ path: 'item-type/craftingplansmith' }), false);
    assert.equal(isGearType({ path: 'item-type/ring' }), true);
    assert.equal(isGearType({ path: 'item-type/upgradeablejewel' }), true);
  });

  it('keeps live items, also without a Unique id, and skips PTR copies', () => {
    assert.equal(isLiveItem({ id: 'x1_FollowerItem_Templar_Legendary_01' }), true);
    assert.equal(isLiveItem({ id: 'Unique_Gem_001_x1_PTR' }), false);
  });
});

describe('toEntry', () => {
  it('maps a set item', () => {
    assert.deepEqual(toEntry(detail()), {
      id: 'Unique_Ring_013_x1',
      slug: 'the-compass-rose',
      name: 'The Compass Rose',
      quality: 'set',
      type: 'Set Ring',
      slot: 'left-finger',
      set: 'Endless Walk',
      icon: 'unique_ring_013_x1_demonhunter_male',
    });
  });

  it('treats upgradeable jewels as gems, whatever their colour', () => {
    assert.equal(toEntry(detail({ type: { id: 'UpgradeableJewel' }, color: 'orange' })).quality, 'gem');
  });

  it('drops magic items and missing details', () => {
    assert.equal(toEntry(detail({ color: 'blue' })), null);
    assert.equal(toEntry(null), null);
  });
});

describe('keepNewestPerName', () => {
  it('keeps the newest patch of an item and sorts by name', () => {
    const entries = [
      { id: 'Unique_Ring_109_x1', name: 'Pandemonium Loop', quality: 'legendary' },
      { id: 'Unique_Ring_109_p2', name: 'Pandemonium Loop', quality: 'legendary' },
      { id: 'Unique_Ring_001_x1', name: 'Avarice Band', quality: 'legendary' },
    ];
    assert.deepEqual(keepNewestPerName(entries).map((entry) => entry.id), ['Unique_Ring_001_x1', 'Unique_Ring_109_p2']);
  });

  it('reads the patch number from either end of the id', () => {
    assert.equal(patchNumber('P73_Unique_Gem_128'), 73);
    assert.equal(patchNumber('Unique_Ring_109_p2'), 2);
    assert.equal(patchNumber('Unique_Ring_013_x1'), 0);
  });
});
