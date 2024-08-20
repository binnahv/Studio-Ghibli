// Substitua 'YOUR_API_KEY' pela sua chave da TMDb API
const apiKey = 'YOUR_API_KEY';

fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
  .then(response => response.json())
  .then(data => {
    const movies = data.results;
    const movieContainer = document.querySelector('.movie-container');

    movies.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.classList.add('movie');

      movieElement.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
      `;

      movieContainer.appendChild(movieElement);
    });
  });