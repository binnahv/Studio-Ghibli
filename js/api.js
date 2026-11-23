// Camada de acesso à API: o resto do app não sabe de URLs nem de fetch.
import { API_BASE, REQUEST_TIMEOUT_MS } from './config.js';

export async function fetchFilms({ timeout = REQUEST_TIMEOUT_MS } = {}) {
  const response = await fetch(`${API_BASE}/films`, {
    signal: AbortSignal.timeout(timeout),
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Studio Ghibli API responded with HTTP ${response.status}`);
  }

  const films = await response.json();
  if (!Array.isArray(films)) {
    throw new TypeError('Unexpected API response: expected a list of films');
  }
  return films;
}

// O TMDB serve o banner em vários tamanhos; a API entrega um pequeno (533px).
// Para o hero pedimos a versão de 1280px trocando só o segmento de tamanho.
export function largeBanner(url) {
  return url?.replace(/\/t\/p\/[^/]+\//, '/t/p/w1280/') ?? '';
}
