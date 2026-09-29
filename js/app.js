// js/app.js
// Orquestrador principal do app
import { fetchFilms } from './filmService.js';
import { setHeroBanner } from './ui.js';
import { initSearch } from './search.js';

const spinner = document.getElementById('spinner');
const errorMsg = document.getElementById('error');

async function initiate() {
  try {
    spinner.classList.remove('d-none');
    errorMsg.classList.add('d-none');
    const films = await fetchFilms();
    setHeroBanner(films);
    initSearch(films); // renderiza a 1ª página e cuida de busca e paginação
  } catch (err) {
    console.error('Erro no app:', err);
    errorMsg.classList.remove('d-none');
  } finally {
    spinner.classList.add('d-none');
  }
}

// Registro do service worker (era o que faltava para o PWA funcionar)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err =>
      console.warn('Service worker não registrado:', err));
  });
}

initiate(); // módulos já executam após o DOM estar pronto
