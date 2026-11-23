import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRuntime, describeResults, favoriteLabel } from '../js/format.js';

test('formatRuntime converte minutos', () => {
  assert.equal(formatRuntime('124'), '2h 4min');
  assert.equal(formatRuntime(45), '45min');
  assert.equal(formatRuntime(''), '—');
});

test('describeResults monta a frase conforme a busca', () => {
  assert.equal(describeResults({ total: 0, shown: 0 }), '');
  assert.equal(describeResults({ total: 1, shown: 1 }), '1 film');
  assert.equal(describeResults({ total: 22, shown: 12 }), '22 films · showing 12');
  assert.equal(
    describeResults({ total: 2, shown: 2, query: 'pon', favoritesOnly: true }),
    '2 films in your favourites matching “pon”',
  );
});

test('favoriteLabel descreve a ação do botão', () => {
  assert.equal(favoriteLabel('Ponyo', false), 'Add Ponyo to favourites');
  assert.equal(favoriteLabel('Ponyo', true), 'Remove Ponyo from favourites');
});
