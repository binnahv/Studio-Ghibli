// js/filmService.js
// Serviço para buscar filmes da API
import { API_BASE } from './config.js';

export async function fetchFilms() {
  const response = await fetch(`${API_BASE}/films`);
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}
