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
        filmsList.innerHTML = '<p>An error occurred while loading the movies. Please try again later.</p>';
    }
}
// Em Manutenção falta Adicionar as funcionalidades de login! <3
document.getElementById('loginBtn').addEventListener('click', function() {
    alert('Login button clicked!');
});

// Função para renderizar os filmes
function renderFilms(filmsData) {
    filmsList.innerHTML = '';

    filmsData.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('film-card', 'col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');
        filmCard.innerHTML = `
            <h5>${film.title}</h5>
            <img src="${film.image}" alt="${film.title}">
            <p><strong>Director:</strong> ${film.director}</p>
            <p><strong>Year:</strong> ${film.release_date}</p>   
            <p><strong>Score:</strong> ${film.rt_score}</p>
            <button class="btn btn-primary w-100 mt-2 details-button" value="search button" data-id="${film.id}">Movie Details</button>
        `;
        filmsList.appendChild(filmCard);
    });

    // Event listener botões de detalhes
    const detailsButtons = document.querySelectorAll('.details-button');
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filmId = this.getAttribute('data-id');
            const selectedFilm = films.find(film => film.id === filmId);
            showFilmDetails(selectedFilm);
        });
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
    document.getElementById('modalFilmYear').textContent = film.release_date;
    document.getElementById('modalFilmScore').textContent = film.rt_score;

    filmModal.show();
}

// Event listeners
searchButton.addEventListener('click', () => {
    searchFilms(searchInput.value);
});

searchInput.addEventListener('input', function() {
    if (this.value === '') {
        renderFilms(films);
    } else {
        searchFilms(this.value);
    }
});

// Chamar a função para buscar os filmes ao carregar a página
fetchFilms();
