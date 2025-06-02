// js/modal.js
// Lógica para exibir detalhes do filme e acionar modal Bootstrap
export function showFilmDetails(film) {
  document.getElementById('modalFilmImage').src = film.image || 'https://via.placeholder.com/350x200?text=No+Image';
  document.getElementById('modalFilmDirector').textContent = film.director;
  document.getElementById('modalFilmYear').textContent = film.release_date;
  document.getElementById('modalFilmScore').textContent = film.rt_score;
  document.getElementById('modalFilmDescription').textContent = film.description;
  const modalEl = document.getElementById('filmModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
