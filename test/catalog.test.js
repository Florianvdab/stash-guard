import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCatalog, normalize } from '../js/catalog.js';

const items = [
  { id: 'a', name: 'Ring of Royal Grandeur', quality: 'legendary' },
  { id: 'b', name: 'The Compass Rose', quality: 'set', set: 'Endless Walk' },
  { id: 'c', name: "Zei's Stone of Vengeance", quality: 'gem' },
  { id: 'd', name: 'Royal Ring', quality: 'legendary' },
];
const catalog = createCatalog(items);
const names = (results) => results.map((item) => item.name);

describe('normalize', () => {
  it('lowercases and drops apostrophes, accents and punctuation', () => {
    assert.equal(normalize("Zei's  Stóne-of"), 'zeis stone of');
  });
});

describe('catalog.search', () => {
  it('returns nothing for an empty query', () => {
    assert.deepEqual(catalog.search('   '), []);
  });

  it('matches every word in any order', () => {
    assert.deepEqual(names(catalog.search('grandeur ring')), ['Ring of Royal Grandeur']);
  });

  it('ignores apostrophes in the query and the name', () => {
    assert.deepEqual(names(catalog.search('zeis')), ["Zei's Stone of Vengeance"]);
  });

  it('finds set items by their set name', () => {
    assert.deepEqual(names(catalog.search('endless walk')), ['The Compass Rose']);
  });

  it('ranks names that start with the query first', () => {
    assert.deepEqual(names(catalog.search('royal')), ['Royal Ring', 'Ring of Royal Grandeur']);
  });
});

describe('catalog.find', () => {
  it('finds an entry by id', () => {
    assert.equal(catalog.find({ id: 'b', name: 'whatever' }).name, 'The Compass Rose');
  });

  it('falls back to the name when the id is unknown', () => {
    assert.equal(catalog.find({ id: 'old-id', name: 'Royal Ring' }).id, 'd');
  });
});
