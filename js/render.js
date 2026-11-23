// Tudo que desenha no DOM. Dados da API entram só via textContent/atributos,
// nunca via innerHTML, então não há risco de injeção de HTML.
import { FALLBACK_IMG } from './config.js';
import { pageRange } from './filters.js';
import { favoriteLabel } from './format.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Cria um elemento: el('p', { className: 'x' }, 'texto', outroNó). */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-') || key.startsWith('aria-')) node.setAttribute(key, value);
    else node[key] = value;
  }
  node.append(...children);
  return node;
}

export function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

/** Imagem com lazy-load, fade-in quando carrega e fallback se o link quebrar. */
export function setImage(img, src) {
  img.dataset.loading = '';
  img.addEventListener('load', () => delete img.dataset.loading, { once: true });
  img.addEventListener('error', () => {
    delete img.dataset.loading;
    img.src = FALLBACK_IMG;
  }, { once: true });
  img.src = src || FALLBACK_IMG;
}

function createCard(film, index, isFavorite) {
  const poster = el('img', { alt: '', loading: index < 6 ? 'eager' : 'lazy', decoding: 'async' });
  setImage(poster, film.image);

  return el('li', { className: 'card', 'data-id': film.id, style: `--i:${index}` },
    el('div', { className: 'card__media' },
      poster,
      el('span', { className: 'card__score', 'aria-label': `Rotten Tomatoes score ${film.rt_score}%` },
        icon('star'), `${film.rt_score}%`),
    ),
    el('button', {
      type: 'button',
      className: 'card__fav',
      'data-action': 'favorite',
      'aria-pressed': String(isFavorite),
      'aria-label': favoriteLabel(film.title, isFavorite),
    }, icon('heart')),
    el('div', { className: 'card__body' },
      el('h3', { className: 'card__title' },
        el('button', { type: 'button', className: 'card__open', 'data-action': 'open' }, film.title)),
      el('p', { className: 'card__meta' }, `${film.release_date} · ${film.director}`),
    ),
  );
}

export function renderFilms(list, films, favorites) {
  list.replaceChildren(...films.map((film, i) => createCard(film, i, favorites.has(film.id))));
  list.setAttribute('aria-busy', 'false');
}

export function renderSkeletons(list, count) {
  const skeleton = () => el('li', { className: 'card card--skeleton', 'aria-hidden': 'true' },
    el('div', { className: 'card__media' }),
    el('div', { className: 'line' }),
    el('div', { className: 'line' }),
  );
  list.replaceChildren(...Array.from({ length: count }, skeleton));
  list.setAttribute('aria-busy', 'true');
}

/** Atualiza só o botão de favorito de um card, sem redesenhar a grade. */
export function updateCardFavorite(list, film, isFavorite) {
  const button = list.querySelector(`[data-id="${CSS.escape(film.id)}"] [data-action="favorite"]`);
  if (!button) return;
  button.setAttribute('aria-pressed', String(isFavorite));
  button.setAttribute('aria-label', favoriteLabel(film.title, isFavorite));
}

export function renderPagination(nav, { page, totalPages }) {
  if (totalPages <= 1) {
    nav.replaceChildren();
    return;
  }

  const pageButton = (label, target, aria, extra = {}) =>
    el('button', { type: 'button', 'data-page': target, 'aria-label': aria, ...extra }, label);

  nav.replaceChildren(
    pageButton('‹', page - 1, 'Previous page', { disabled: page === 1 }),
    ...pageRange(page, totalPages).map((p) =>
      p === '…'
        ? el('span', { 'aria-hidden': 'true' }, '…')
        : pageButton(String(p), p, `Page ${p}`, p === page ? { 'aria-current': 'page' } : {}),
    ),
    pageButton('›', page + 1, 'Next page', { disabled: page === totalPages }),
  );
}
