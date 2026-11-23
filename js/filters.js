// Funções puras (sem DOM): filtram, ordenam e paginam a lista de filmes.
// Por não dependerem do navegador, são cobertas por testes em tests/.

/** Minúsculas, sem acentos e sem espaços nas pontas ("Ghíbli " → "ghibli"). */
export function normalize(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

const MATCHERS = {
  title: (film, q) =>
    normalize(film.title).includes(q) ||
    normalize(film.original_title_romanised).includes(q),
  director: (film, q) => normalize(film.director).includes(q),
  // "198" encontra a década de 1980 inteira
  year: (film, q) => String(film.release_date).startsWith(q),
};

export const SEARCH_FIELDS = Object.keys(MATCHERS);

export function filterFilms(films, { query = '', field = 'title', favorites = null } = {}) {
  const q = normalize(query);
  const matches = MATCHERS[field] ?? MATCHERS.title;

  return films.filter(
    (film) => (!favorites || favorites.has(film.id)) && (!q || matches(film, q)),
  );
}

const byTitle = (a, b) => a.title.localeCompare(b.title);
const num = (value) => Number(value) || 0;

const SORTERS = {
  'year-asc': (a, b) => num(a.release_date) - num(b.release_date) || byTitle(a, b),
  'year-desc': (a, b) => num(b.release_date) - num(a.release_date) || byTitle(a, b),
  'score-desc': (a, b) => num(b.rt_score) - num(a.rt_score) || byTitle(a, b),
  'title-asc': byTitle,
};

export const SORT_OPTIONS = Object.keys(SORTERS);

/** Retorna uma cópia ordenada; nunca altera o array original. */
export function sortFilms(films, sort = 'year-asc') {
  return [...films].sort(SORTERS[sort] ?? SORTERS['year-asc']);
}

export function paginate(items, page, perPage) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (current - 1) * perPage;

  return { items: items.slice(start, start + perPage), page: current, totalPages };
}

/**
 * Números de página a exibir, com reticências quando há muitas páginas.
 * pageRange(5, 10) → [1, '…', 4, 5, 6, '…', 10]
 */
export function pageRange(current, total, siblings = 1) {
  const pages = [];
  for (let p = 1; p <= total; p++) {
    const isEdge = p === 1 || p === total;
    const isNear = Math.abs(p - current) <= siblings;
    if (isEdge || isNear) {
      pages.push(p);
    } else if (pages.at(-1) !== '…') {
      pages.push('…');
    }
  }
  return pages;
}
