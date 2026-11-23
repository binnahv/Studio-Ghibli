import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, filterFilms, sortFilms, paginate, pageRange } from '../js/filters.js';

const films = [
  { id: '1', title: 'My Neighbor Totoro', original_title_romanised: 'Tonari no Totoro', director: 'Hayao Miyazaki', release_date: '1988', rt_score: '93' },
  { id: '2', title: 'Grave of the Fireflies', original_title_romanised: 'Hotaru no haka', director: 'Isao Takahata', release_date: '1988', rt_score: '97' },
  { id: '3', title: 'Ponyo', original_title_romanised: 'Gake no ue no Ponyo', director: 'Hayao Miyazaki', release_date: '2008', rt_score: '92' },
  { id: '4', title: 'Pom Poko', original_title_romanised: 'Heisei tanuki gassen Ponpoko', director: 'Isao Takahata', release_date: '1994', rt_score: '78' },
];
const ids = (list) => list.map((film) => film.id);

test('normalize ignora acentos, caixa e espaços', () => {
  assert.equal(normalize('  Ghíbli TÔTORO '), 'ghibli totoro');
  assert.equal(normalize(undefined), '');
});

test('filterFilms busca pelo título em inglês e pelo romanizado', () => {
  assert.deepEqual(ids(filterFilms(films, { query: 'totoro' })), ['1']);
  assert.deepEqual(ids(filterFilms(films, { query: 'TANUKI' })), ['4']);
});

test('filterFilms busca por diretor e por ano/década', () => {
  assert.deepEqual(ids(filterFilms(films, { query: 'takahata', field: 'director' })), ['2', '4']);
  assert.deepEqual(ids(filterFilms(films, { query: '1988', field: 'year' })), ['1', '2']);
  assert.deepEqual(ids(filterFilms(films, { query: '199', field: 'year' })), ['4']);
});

test('filterFilms sem busca devolve tudo; campo inválido cai no título', () => {
  assert.equal(filterFilms(films, { query: '   ' }).length, films.length);
  assert.deepEqual(ids(filterFilms(films, { query: 'ponyo', field: 'nope' })), ['3']);
});

test('filterFilms restringe aos favoritos quando recebe o Set', () => {
  assert.deepEqual(ids(filterFilms(films, { favorites: new Set(['3', '4']) })), ['3', '4']);
  assert.deepEqual(ids(filterFilms(films, { query: 'pom', favorites: new Set(['3', '4']) })), ['4']);
});

test('sortFilms ordena sem alterar o array original', () => {
  const original = ids(films);
  assert.deepEqual(ids(sortFilms(films, 'score-desc')), ['2', '1', '3', '4']);
  assert.deepEqual(ids(sortFilms(films, 'year-desc')), ['3', '4', '2', '1']);
  assert.deepEqual(ids(sortFilms(films, 'title-asc')), ['2', '1', '4', '3']);
  assert.deepEqual(ids(films), original);
});

test('sortFilms desempata pelo título quando o ano é igual', () => {
  assert.deepEqual(ids(sortFilms(films, 'year-asc')).slice(0, 2), ['2', '1']);
});

test('paginate corta a página e corrige páginas fora do intervalo', () => {
  const items = [1, 2, 3, 4, 5];
  assert.deepEqual(paginate(items, 2, 2), { items: [3, 4], page: 2, totalPages: 3 });
  assert.equal(paginate(items, 99, 2).page, 3);
  assert.equal(paginate(items, -1, 2).page, 1);
  assert.deepEqual(paginate([], 1, 2), { items: [], page: 1, totalPages: 1 });
});

test('pageRange usa reticências quando há muitas páginas', () => {
  assert.deepEqual(pageRange(1, 3), [1, 2, 3]);
  assert.deepEqual(pageRange(5, 10), [1, '…', 4, 5, 6, '…', 10]);
  assert.deepEqual(pageRange(1, 10), [1, 2, '…', 10]);
});
