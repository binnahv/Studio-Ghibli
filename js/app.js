// js/app.js
// Orquestrador principal do app
import { fetchFilms } from './filmService.js';
import { displayFilms } from './ui.js';
import { initSearch } from './search.js';

const spinner = document.getElementById('spinner');
const errorMsg = document.getElementById('error');

async function initiate() {
  try {
    spinner.classList.remove('d-none');
    errorMsg.classList.add('d-none');
    const films = await fetchFilms();
    displayFilms(films);
    initSearch(films);
  } catch (err) {
    console.error('Erro no app:', err);
    errorMsg.classList.remove('d-none');
  } finally {
    spinner.classList.add('d-none');
  }
}

document.addEventListener('DOMContentLoaded', initiate);
