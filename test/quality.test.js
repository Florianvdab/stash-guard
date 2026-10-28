import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALL, countByQuality, hasQuality } from '../js/quality.js';

const items = [{ quality: 'legendary' }, { quality: 'legendary' }, { quality: 'gem' }];

describe('quality', () => {
  it('counts items per quality, including zero counts', () => {
    assert.deepEqual(countByQuality(items), { all: 3, legendary: 2, set: 0, gem: 1 });
  });

  it('filters by quality', () => {
    assert.equal(items.filter(hasQuality('gem')).length, 1);
    assert.equal(items.filter(hasQuality(ALL)).length, 3);
  });
});
