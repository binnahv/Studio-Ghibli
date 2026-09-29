// js/ui.js
import { showFilmDetails } from './modal.js';
import { FALLBACK_IMG } from './config.js';

const filmsList = document.querySelector('.films-list');

// Cria elementos com textContent (sem innerHTML), então dados da API nunca viram HTML
function createCard(film) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-3 d-flex';

  const card = document.createElement('article');
  card.className = 'film-card';

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.src = film.image || FALLBACK_IMG;
  img.alt = `Pôster de ${film.title}`;
  img.addEventListener('error', () => { img.src = FALLBACK_IMG; }, { once: true });

  const title = document.createElement('h4');
  title.textContent = film.title;

  card.append(img, title);

  [['Diretor', film.director], ['Ano', film.release_date], ['Rotten Tomatoes', `${film.rt_score}%`]]
    .forEach(([label, value]) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      p.append(strong, value);
      card.append(p);
    });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'details-button';
  button.textContent = 'Detalhes';
  button.setAttribute('aria-label', `Ver detalhes de ${film.title}`);
  button.addEventListener('click', () => showFilmDetails(film));

  card.append(button);
  col.append(card);
  return col;
}

export function displayFilms(films) {
  filmsList.replaceChildren(...films.map(createCard));
}

// Mensagem abaixo da barra de busca (só aparece quando há uma pesquisa ativa)
export function showResultsInfo(total, isSearching) {
  const info = document.getElementById('results-info');
  if (!isSearching) { info.textContent = ''; return; }
  info.textContent = total === 0
    ? 'Não foi encontrado resultado para a sua pesquisa.'
    : `${total} ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
}

// Botões de paginação (Bootstrap). Some quando só existe uma página.
export function renderPagination(totalPages, currentPage, onChange) {
  const nav = document.getElementById('pagination');
  nav.replaceChildren();
  if (totalPages <= 1) return;

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  const item = (label, page, { disabled = false, active = false, aria } = {}) => {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'page-link';
    btn.textContent = label;
    btn.disabled = disabled;
    if (aria) btn.setAttribute('aria-label', aria);
    if (active) btn.setAttribute('aria-current', 'page');
    btn.addEventListener('click', () => onChange(page));
    li.append(btn);
    return li;
  };

  ul.append(item('«', currentPage - 1, { disabled: currentPage === 1, aria: 'Página anterior' }));
  for (let p = 1; p <= totalPages; p++) {
    ul.append(item(String(p), p, { active: p === currentPage, aria: `Página ${p}` }));
  }
  ul.append(item('»', currentPage + 1, { disabled: currentPage === totalPages, aria: 'Próxima página' }));
  nav.append(ul);
}

// Usa o movie_banner de um filme aleatório da própria API como fundo do hero
export function setHeroBanner(films) {
  const hero = document.getElementById('hero');
  const withBanner = films.filter(f => f.movie_banner);
  if (!hero || withBanner.length === 0) return;
  const pick = withBanner[Math.floor(Math.random() * withBanner.length)];
  hero.style.setProperty('--hero-image', `url("${pick.movie_banner}")`);
}
