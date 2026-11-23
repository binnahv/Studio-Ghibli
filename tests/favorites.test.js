import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadFavorites, saveFavorites, toggleFavorite } from '../js/favorites.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
  };
}

test('toggleFavorite adiciona e remove sem mutar o Set original', () => {
  const start = new Set(['a']);
  assert.deepEqual([...toggleFavorite(start, 'b')], ['a', 'b']);
  assert.deepEqual([...toggleFavorite(start, 'a')], []);
  assert.deepEqual([...start], ['a']);
});

test('saveFavorites + loadFavorites fazem a ida e volta', () => {
  const storage = memoryStorage();
  saveFavorites(new Set(['x', 'y']), storage);
  assert.deepEqual([...loadFavorites(storage)], ['x', 'y']);
});

test('loadFavorites tolera storage vazio, corrompido ou indisponível', () => {
  assert.equal(loadFavorites(memoryStorage()).size, 0);
  assert.equal(loadFavorites({ getItem: () => '{not json' }).size, 0);
  assert.equal(loadFavorites({ getItem: () => '"string"' }).size, 0);
  assert.equal(loadFavorites(null).size, 0);
});

test('saveFavorites não quebra quando o storage lança erro', () => {
  const full = { setItem: () => { throw new Error('QuotaExceeded'); } };
  assert.doesNotThrow(() => saveFavorites(new Set(['a']), full));
});
