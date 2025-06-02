// js/filmService.js
// Serviço para buscar filmes da API
export async function fetchFilms() {
  try {
    const response = await fetch('https://ghibliapi.vercel.app/films');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (err) {
    throw new Error('Erro ao buscar filmes: ' + err.message);
  }
}
