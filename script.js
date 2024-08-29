document.addEventListener("DOMContentLoaded", () => {
    // Carregar e exibir filmes
    fetchFilms();

    // Realizar busca em tempo real
    document.getElementById("search").addEventListener("input", performSearch);
});

// Buscar filmes da API
async function fetchFilms() {
    try {
        const response = await fetch("https://ghibliapi.vercel.app/films");
        const films = await response.json();
        displayFilms(films);

        // Armazenar filmes
        window.allFilms = films;
    } catch (error) {
        console.error("Erro ao buscar filmes:", error);
    }
}

// Exibir os filmes na tela
function displayFilms(films) {
    const filmsList = document.querySelector(".films-list");
    filmsList.innerHTML = ""; // Limpar lista de filmes antes de exibir

    films.forEach((film) => {
        const filmCard = document.createElement("div");
        filmCard.className = "film-card col-12 col-md-4 col-lg-3";

        filmCard.innerHTML = `
            <img src="${film.image}" alt="${film.title} Poster">
            <h4>${film.title}</h4>
            <p>Director: ${film.director}</p>
            <p>Year: ${film.release_date}</p>
            <p>Score: ${film.rt_score}</p>
            <button class="details-button" aria-label="View details for ${film.title}" data-bs-toggle="modal" data-bs-target="#filmModal" data-film-id="${film.id}">
                Details
            </button>
        `;

        // Botão de detalhes
        filmCard.querySelector(".details-button").addEventListener("click", () => {
            showFilmDetails(film);
        });

        filmsList.appendChild(filmCard);
    });
}

// Exibir detalhes do filme no modal
function showFilmDetails(film) {
    document.getElementById("modalFilmImage").src = film.image;
    document.getElementById("modalFilmDirector").textContent = film.director;
    document.getElementById("modalFilmYear").textContent = film.release_date;
    document.getElementById("modalFilmScore").textContent = film.rt_score;
    document.getElementById("modalFilmDescription").textContent = film.description;
}

// Realizar a pesquisa em tempo real
function performSearch() {
    const query = document.getElementById("search").value.toLowerCase();

    // Filtrar filmes com base na consulta de pesquisa
    const filteredFilms = window.allFilms.filter((film) => {
        return (
            film.title.toLowerCase().includes(query) ||
            film.director.toLowerCase().includes(query) ||
            film.release_date.includes(query) ||
            film.rt_score.includes(query)
        );
    });

    displayFilms(filteredFilms);

    // Se a consulta estiver vazia vai exibir todos os filmes!!
    if (query === "") {
        displayFilms(window.allFilms);
    }
}
