// Textos exibidos na tela. Funções puras, cobertas por testes.

/** "124" → "2h 4min" */
export function formatRuntime(minutes) {
  const total = Number(minutes);
  if (!total) return '—';
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m}min` : `${m}min`;
}

/** "22 films matching “miya” · showing 12" */
export function describeResults({ total, shown, query = '', favoritesOnly = false }) {
  if (total === 0) return '';
  const films = `${total} ${total === 1 ? 'film' : 'films'}`;
  const scope = favoritesOnly ? ' in your favourites' : '';
  const match = query ? ` matching “${query}”` : '';
  const page = shown < total ? ` · showing ${shown}` : '';
  return `${films}${scope}${match}${page}`;
}

export function favoriteLabel(title, isFavorite) {
  return isFavorite ? `Remove ${title} from favourites` : `Add ${title} to favourites`;
}
