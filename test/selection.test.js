import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wrapIndex } from '../js/selection.js';

describe('wrapIndex', () => {
  it('wraps around both ends', () => {
    assert.equal(wrapIndex(3, 3), 0);
    assert.equal(wrapIndex(-1, 3), 2);
  });

  it('stays at 0 for an empty list', () => {
    assert.equal(wrapIndex(1, 0), 0);
  });
});
