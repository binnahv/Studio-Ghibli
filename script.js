const apiUrl = 'https://ghibliapi.vercel.app/films';
const filmsList = document.querySelector('.films-list');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('search-button');
const filmModal = new bootstrap.Modal(document.getElementById('filmModal'));
let films = [];

// Função para buscar os filmes da API
async function fetchFilms() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        films = data;
        renderFilms(films);
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
        filmCard.classList.add('film-card', 'col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');
        filmCard.innerHTML = `
            <h5>${film.title}</h5>
            <img src="${film.image}" alt="${film.title}">
            <p><strong>Diretor:</strong> ${film.director}</p>
            <p><strong>Ano:</strong> ${film.release_date}</p>   
            <p><strong>Score:</strong> ${film.rt_score}</p>

            <div class="card-icons">
                <i class="bi bi-heart"></i>
                <i class="bi bi-bookmark"></i>
            </div>
        `;
        filmCard.addEventListener('click', () => showFilmDetails(film));
        filmsList.appendChild(filmCard);
    });
}

// Função para implementar a busca
function searchFilms(searchTerm) {
    const filteredFilms = films.filter(film =>
        film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        film.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        film.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        film.release_date.includes(searchTerm) ||
        film.rt_score.includes(searchTerm)
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
searchButton.addEventListener('click', () => {
    searchFilms(searchInput.value);
});

searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchFilms(searchInput.value);
    }
});

// Chamar a função para buscar os filmes ao carregar a página
fetchFilms();
