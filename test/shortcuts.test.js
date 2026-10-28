import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchTextFor } from '../js/shortcuts.js';

const key = (value, modifiers = {}) => ({ key: value, ctrlKey: false, metaKey: false, altKey: false, ...modifiers });

describe('searchTextFor', () => {
  it('opens an empty search on "/" and Ctrl/Cmd+K', () => {
    assert.equal(searchTextFor(key('/')), '');
    assert.equal(searchTextFor(key('k', { ctrlKey: true })), '');
    assert.equal(searchTextFor(key('K', { metaKey: true })), '');
  });

  it('starts the search with a typed letter or digit', () => {
    assert.equal(searchTextFor(key('z')), 'z');
    assert.equal(searchTextFor(key('7')), '7');
  });

  it('ignores other keys and browser shortcuts', () => {
    assert.equal(searchTextFor(key('Enter')), null);
    assert.equal(searchTextFor(key(' ')), null);
    assert.equal(searchTextFor(key('r', { ctrlKey: true })), null);
    assert.equal(searchTextFor(key('/', { ctrlKey: true })), null);
  });
});
