// js/modal.js
// Lógica para exibir detalhes do filme no modal Bootstrap
import { FALLBACK_IMG } from './config.js';

export function showFilmDetails(film) {
  const image = document.getElementById('modalFilmImage');
  image.src = film.image || FALLBACK_IMG;
  image.alt = `Pôster de ${film.title}`;

  document.getElementById('filmModalLabel').textContent = film.title;
  document.getElementById('modalFilmDirector').textContent = film.director;
  document.getElementById('modalFilmYear').textContent = film.release_date;
  document.getElementById('modalFilmScore').textContent = `${film.rt_score}%`;
  document.getElementById('modalFilmDescription').textContent = film.description;

  // getOrCreateInstance evita criar uma instância nova a cada clique
  bootstrap.Modal.getOrCreateInstance(document.getElementById('filmModal')).show();
}
