// js/search.js
// Debounce e lógica de busca em tempo real
import { displayFilms } from './ui.js';

function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function initSearch(allFilms) {
  const input = document.getElementById('search');
  input.addEventListener('input', debounce(() => {
    const query = input.value.toLowerCase();
    let filtered = allFilms.filter(film =>
      film.title.toLowerCase().includes(query) ||
      film.director.toLowerCase().includes(query) ||
      film.release_date.includes(query) ||
      film.rt_score.includes(query)
    );
    if (!query) filtered = allFilms;
    displayFilms(filtered);
  }, 300));
}
