// js/ui.js
import { showFilmDetails } from './modal.js';

const filmsList = document.querySelector('.films-list');

// Renderiza lista de filmes
export function displayFilms(films) {
  filmsList.innerHTML = '';

  films.forEach(film => {
    const card = document.createElement('div');
    card.className = 'film-card col-12 col-md-4 col-lg-3';

    card.innerHTML = `
      <img loading="lazy" src="${film.image || 'img/fallback.jpg'}" alt="${film.title} Poster" class="film-image">
      <h4>${film.title}</h4>
      <p>Director: ${film.director}</p>
      <p>Year: ${film.release_date}</p>
      <p>Score: ${film.rt_score}</p>
      <button class="details-button" aria-label="View details for ${film.title}" data-film-id="${film.id}">
        Details
      </button>
    `;

    card.querySelector('.details-button').addEventListener('click', () => showFilmDetails(film));
    filmsList.appendChild(card);
  });
}
