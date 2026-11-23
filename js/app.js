// Ponto de entrada: guarda o estado, liga os eventos e decide o que redesenhar.
import { PER_PAGE, SEARCH_DEBOUNCE_MS } from './config.js';
import { fetchFilms, largeBanner } from './api.js';
import { filterFilms, sortFilms, paginate, SEARCH_FIELDS, SORT_OPTIONS } from './filters.js';
import { loadFavorites, saveFavorites, toggleFavorite } from './favorites.js';
import { describeResults } from './format.js';
import { renderFilms, renderSkeletons, renderPagination, updateCardFavorite } from './render.js';
import { initModal, openModal, syncModalFavorite, isModalShowing } from './modal.js';

const dom = {
  hero: document.getElementById('hero'),
  heroCredit: document.getElementById('hero-credit'),
  toolbar: document.querySelector('.toolbar'),
  form: document.getElementById('search-form'),
  search: document.getElementById('search'),
  fields: document.getElementById('search-field'),
  sort: document.getElementById('sort'),
  favToggle: document.getElementById('favorites-toggle'),
  favCount: document.getElementById('favorites-count'),
  info: document.getElementById('results-info'),
  list: document.getElementById('films'),
  pagination: document.getElementById('pagination'),
  error: document.getElementById('error'),
  retry: document.getElementById('retry'),
  empty: document.getElementById('empty'),
  clear: document.getElementById('clear-filters'),
};

const PLACEHOLDERS = {
  title: 'Search by title, e.g. Totoro',
  director: 'Search by director, e.g. Miyazaki',
  year: 'Search by year, e.g. 1988 or 199',
};

const DEFAULTS = { query: '', field: 'title', sort: 'year-asc', favoritesOnly: false, page: 1 };

const state = {
  films: [],
  favorites: loadFavorites(),
  ...DEFAULTS,
  ...readUrl(),
};

// --- URL <-> estado: uma busca pode ser compartilhada por link -------------
function readUrl() {
  const params = new URLSearchParams(location.search);
  const field = params.get('in');
  const sort = params.get('sort');
  return {
    query: params.get('q') ?? DEFAULTS.query,
    field: SEARCH_FIELDS.includes(field) ? field : DEFAULTS.field,
    sort: SORT_OPTIONS.includes(sort) ? sort : DEFAULTS.sort,
    favoritesOnly: params.get('fav') === '1',
    page: Number(params.get('page')) || DEFAULTS.page,
  };
}

function writeUrl() {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.field !== DEFAULTS.field) params.set('in', state.field);
  if (state.sort !== DEFAULTS.sort) params.set('sort', state.sort);
  if (state.favoritesOnly) params.set('fav', '1');
  if (state.page > 1) params.set('page', state.page);
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

// --- Renderização -----------------------------------------------------------
function visibleFilms() {
  const filtered = filterFilms(state.films, {
    query: state.query,
    field: state.field,
    favorites: state.favoritesOnly ? state.favorites : null,
  });
  return sortFilms(filtered, state.sort);
}

function render() {
  const results = visibleFilms();
  const view = paginate(results, state.page, PER_PAGE);
  state.page = view.page;

  renderFilms(dom.list, view.items, state.favorites);
  renderPagination(dom.pagination, view);
  dom.empty.hidden = results.length > 0;
  dom.info.textContent = describeResults({
    total: results.length,
    shown: view.items.length,
    query: state.query.trim(),
    favoritesOnly: state.favoritesOnly,
  });
  writeUrl();
}

function syncControls() {
  dom.search.value = state.query;
  dom.search.placeholder = PLACEHOLDERS[state.field];
  dom.fields.querySelector(`[value="${state.field}"]`).checked = true;
  dom.sort.value = state.sort;
  dom.favToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
  dom.favCount.textContent = state.favorites.size;
}

function update(changes, { resetPage = true } = {}) {
  // O texto digitado sempre vale, mesmo se o debounce da busca ainda não rodou
  Object.assign(state, { query: dom.search.value }, changes, resetPage ? { page: 1 } : {});
  syncControls();
  render();
}

function setHeroBanner(films) {
  const withBanner = films.filter((film) => film.movie_banner);
  if (withBanner.length === 0) return;

  const film = withBanner[Math.floor(Math.random() * withBanner.length)];
  const show = (url) => {
    dom.hero.style.setProperty('--hero-image', `url("${url}")`);
    dom.hero.classList.add('has-image');
    dom.heroCredit.textContent = `Featured: ${film.title} (${film.release_date})`;
  };

  // Pré-carrega para o fade-in só começar com a imagem pronta
  const preload = new Image();
  preload.onload = () => show(preload.src);
  preload.onerror = () => { if (preload.src !== film.movie_banner) preload.src = film.movie_banner; };
  preload.src = largeBanner(film.movie_banner);
}

// --- Favoritos -----------------------------------------------------------------
function handleToggleFavorite(film) {
  state.favorites = toggleFavorite(state.favorites, film.id);
  saveFavorites(state.favorites);

  const isFavorite = state.favorites.has(film.id);
  dom.favCount.textContent = state.favorites.size;
  if (isModalShowing(film)) syncModalFavorite(isFavorite);

  // Na lista "só favoritos" o card precisa sumir; nos outros casos basta o botão
  if (state.favoritesOnly) render();
  else updateCardFavorite(dom.list, film, isFavorite);
}

// --- Eventos ---------------------------------------------------------------------
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function bindEvents() {
  const runSearch = debounce(() => update({ query: dom.search.value }), SEARCH_DEBOUNCE_MS);
  dom.search.addEventListener('input', runSearch);
  dom.form.addEventListener('submit', (event) => {
    event.preventDefault();
    update({ query: dom.search.value });
  });

  dom.fields.addEventListener('change', (event) => {
    update({ field: event.target.value });
    dom.search.focus();
  });
  dom.sort.addEventListener('change', () => update({ sort: dom.sort.value }));
  dom.favToggle.addEventListener('click', () => update({ favoritesOnly: !state.favoritesOnly }));
  dom.clear.addEventListener('click', () => update({ ...DEFAULTS, sort: state.sort }));
  dom.retry.addEventListener('click', start);

  // Um único listener para todos os cards (event delegation)
  dom.list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    const film = button && state.films.find((f) => f.id === button.closest('[data-id]').dataset.id);
    if (!film) return;
    if (button.dataset.action === 'open') openModal(film, state.favorites.has(film.id));
    if (button.dataset.action === 'favorite') handleToggleFavorite(film);
  });

  dom.pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    update({ page: Number(button.dataset.page) }, { resetPage: false });
    dom.toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Atalho: "/" foca a busca, como no GitHub
  document.addEventListener('keydown', (event) => {
    const typing = event.target.closest('input, select, textarea, dialog[open]');
    if (event.key === '/' && !typing) {
      event.preventDefault();
      dom.search.focus();
    }
  });
}

// --- Inicialização -------------------------------------------------------------
async function start() {
  dom.error.hidden = true;
  dom.empty.hidden = true;
  dom.info.textContent = 'Loading films…';
  renderSkeletons(dom.list, PER_PAGE);

  try {
    state.films = await fetchFilms();
    setHeroBanner(state.films);
    render();
  } catch (error) {
    console.error('Could not load films:', error);
    dom.list.replaceChildren();
    dom.info.textContent = '';
    dom.error.hidden = false;
  }
}

initModal({ onToggleFavorite: handleToggleFavorite });
bindEvents();
syncControls();
start();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch((error) => {
    console.warn('Service worker registration failed:', error);
  });
}
