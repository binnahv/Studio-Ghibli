// Favoritos persistidos no localStorage como uma lista de ids.
import { FAVORITES_KEY } from './config.js';

export function loadFavorites(storage = globalThis.localStorage) {
  try {
    const ids = JSON.parse(storage?.getItem(FAVORITES_KEY) ?? '[]');
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set(); // JSON corrompido ou storage bloqueado: começa vazio
  }
}

export function saveFavorites(favorites, storage = globalThis.localStorage) {
  try {
    storage?.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  } catch {
    // Modo privado / cota cheia: o app continua funcionando sem persistir.
  }
}

/** Retorna um novo Set com o id adicionado ou removido. */
export function toggleFavorite(favorites, id) {
  const next = new Set(favorites);
  if (!next.delete(id)) next.add(id);
  return next;
}
