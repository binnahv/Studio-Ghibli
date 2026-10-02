// js/search.js
// Busca por campo, contagem de resultados e paginação

import {
  displayFilms,
  showResultsInfo,
  renderPagination
} from './ui.js';

const PER_PAGE = 8;

function debounce(fn, delay = 300) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Ignora maiúsculas e acentos ("ghibli" encontra "Ghíbli")
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Um filtro por campo do <select>.
const FILTERS = {
  title: (film, q) =>
    normalize(film.title).includes(q),

  director: (film, q) =>
    normalize(film.director).includes(q),

  year: (film, q) =>
    film.release_date.startsWith(q),

  score: (film, q) =>
    film.rt_score === q
};

const PLACEHOLDERS = {
  title: 'Ex.: Totoro',
  director: 'Ex.: Miyazaki',
  year: 'Ex.: 1988',
  score: 'Ex.: 93'
};

export function initSearch(allFilms) {
  const input = document.getElementById('search');
  const field = document.getElementById('search-field');
  const button = document.getElementById('search-button');

  // Elementos do filtro
  const filterButton = document.getElementById('filter-button');
  const filterMenu = document.getElementById('filter-menu');

  let results = allFilms;
  let page = 1;

  // Abre/fecha o menu do filtro
  filterButton.addEventListener('click', (event) => {
    event.stopPropagation();
    filterMenu.classList.toggle('active');
  });

  // Fecha o menu quando clicar fora dele
  document.addEventListener('click', (event) => {
    if (
      !filterMenu.contains(event.target) &&
      !filterButton.contains(event.target)
    ) {
      filterMenu.classList.remove('active');
    }
  });

  function render() {
    const totalPages = Math.max(
      1,
      Math.ceil(results.length / PER_PAGE)
    );

    page = Math.min(page, totalPages);

    const start = (page - 1) * PER_PAGE;

    displayFilms(
      results.slice(start, start + PER_PAGE)
    );

    renderPagination(
      totalPages,
      page,
      (newPage) => {
        page = newPage;
        render();

        document
          .querySelector('.search-bar')
          .scrollIntoView({
            behavior: 'smooth'
          });
      }
    );

    showResultsInfo(
      results.length,
      input.value.trim() !== ''
    );
  }

  function run() {
    const query = normalize(input.value);

    results = query
      ? allFilms.filter((film) =>
          FILTERS[field.value](film, query)
        )
      : allFilms;

    page = 1;

    render();
  }

  // Pesquisa enquanto digita
  input.addEventListener(
    'input',
    debounce(run, 300)
  );

  // Enter executa a pesquisa
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      run();
    }
  });

  // Botão de pesquisa
  button.addEventListener('click', run);

  // Mudou o tipo de filtro
  field.addEventListener('change', () => {
    input.placeholder = PLACEHOLDERS[field.value];

    run();

    // Fecha o menu depois de escolher
    filterMenu.classList.remove('active');
  });

  // Renderização inicial
  render();
}