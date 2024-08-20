const apiUrl = 'https://ghibliapi.vercel.app/films';
const filmsList = document.querySelector('.films-list');
const searchInput = document.getElementById('search');
const filtersContainer = document.querySelector('.filters');
const filmModal = new bootstrap.Modal(document.getElementById('filmModal'));

let films = [];

// Função para buscar os filmes da API
async function fetchFilms() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    films = data;
    renderFilms(films);
    createFilters(films);
  } catch (error) {
    console.error('Erro ao buscar os filmes:', error);
    filmsList.innerHTML = '<p>Ocorreu um erro ao carregar os filmes. Tente novamente mais tarde.</p>';
  }
}

// Função para renderizar os filmes
function renderFilms(filmsData) {
  filmsList.innerHTML = ''; // Limpar a lista antes de renderizar novamente

  filmsData.forEach(film => {
    const filmCard = document.createElement('div');
    filmCard.classList.add('film-card');
    filmCard.innerHTML = `
      <img src="${film.image}" alt="${film.title}">
      <h5>${film.title}</h5>
      <p>${film.director}</p>
      <p>${film.release_date}</p>
      <p>${film.description}</p>
    `;
    filmCard.addEventListener('click', () => showFilmDetails(film));
    filmsList.appendChild(filmCard);
  });
}

// Função para implementar a busca
function searchFilms(searchTerm) {
  const filteredFilms = films.filter(film =>
    film.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderFilms(filteredFilms);
}

// Função para implementar os filtros
function createFilters(filmsData) {
  // Identificar os diferentes anos presentes nos filmes
  const years = new Set(filmsData.map(film => film.release_date.split('-')[0]));

  // Criar os elementos HTML para os filtros
  filtersContainer.innerHTML = `
    <select id="yearFilter" class="form-select">
      <option value="">Filtrar por Ano</option>
      ${Array.from(years).map(year => `<option value="${year}">${year}</option>`).join('')}
    </select>
  `;

  // Adicionar event listener para o filtro de ano
  document.getElementById('yearFilter').addEventListener('change', filterFilms);
}

// Função para filtrar os filmes com base no ano selecionado
function filterFilms() {
  const year = document.getElementById('yearFilter').value;

  const filteredFilms = films.filter(film =>
    (year === '' || film.release_date.split('-')[0] === year)
  );

  renderFilms(filteredFilms);
}

// Função para mostrar os detalhes do filme em um modal
function showFilmDetails(film) {
  document.getElementById('filmModalLabel').textContent = film.title;
  document.getElementById('modalFilmImage').src = film.image;
  document.getElementById('modalFilmDescription').textContent = film.description;
  document.getElementById('modalFilmDirector').textContent = film.director;
  document.getElementById('modalFilmYear').textContent = film.release_date.split('-')[0];

  filmModal.show();
}

// Event listeners
searchInput.addEventListener('input', () => {
  searchFilms(searchInput.value);
});

// Chamar a função para buscar os filmes ao carregar a página
fetchFilms();
