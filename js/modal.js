// Detalhes do filme num <dialog> nativo: foco preso, Esc fecha e o foco
// volta ao card de origem sem nenhuma biblioteca.
import { setImage } from './render.js';
import { formatRuntime } from './format.js';

const dialog = document.getElementById('film-modal');
const favButton = document.getElementById('modal-favorite');
const $ = (id) => document.getElementById(id);

let currentFilm = null;

export function initModal({ onToggleFavorite }) {
  dialog.addEventListener('click', (event) => {
    // Clique no backdrop (fora do conteúdo) ou no botão de fechar
    if (event.target === dialog || event.target.closest('[data-close]')) dialog.close();
  });

  favButton.addEventListener('click', () => {
    if (currentFilm) onToggleFavorite(currentFilm);
  });

  // Evita rolar a página ao fundo enquanto o modal está aberto
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    currentFilm = null;
  });
}

export function openModal(film, isFavorite) {
  currentFilm = film;

  setImage($('modal-banner'), film.movie_banner || film.image);
  setImage($('modal-poster'), film.image);
  $('modal-poster').alt = `Poster of ${film.title}`;

  $('modal-title').textContent = film.title;
  $('modal-original').textContent = film.original_title ?? '';
  $('modal-romanised').textContent = film.original_title_romanised ?? '';
  $('modal-director').textContent = film.director;
  $('modal-producer').textContent = film.producer;
  $('modal-year').textContent = film.release_date;
  $('modal-runtime').textContent = formatRuntime(film.running_time);
  $('modal-score').textContent = `${film.rt_score}%`;
  $('modal-description').textContent = film.description;

  syncModalFavorite(isFavorite);
  dialog.querySelector('.modal__body').scrollTop = 0;
  document.documentElement.style.overflow = 'hidden';
  dialog.showModal();
}

export function syncModalFavorite(isFavorite) {
  favButton.setAttribute('aria-pressed', String(isFavorite));
  favButton.querySelector('span').textContent = isFavorite ? 'In your favourites' : 'Add to favourites';
}

export function isModalShowing(film) {
  return dialog.open && currentFilm?.id === film.id;
}
