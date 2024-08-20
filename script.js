const filmesList = document.getElementById('filmes');

fetch('https://ghibliapi.vercel.app/films')
    .then(response => response.json())
    .then(data => {
        data.forEach(filme => {
            const li = document.createElement('li');
            li.classList.add('filme');
            li.textContent = filme.title;
            filmesList.appendChild(li);
        });
    });