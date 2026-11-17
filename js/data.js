// Загрузка JSON через fetch() с кэшем: повторный запрос того же файла не уходит в сеть.
const cache = new Map();

export function loadJSON(path) {
  if (!cache.has(path)) {
    const request = fetch(path).then((response) => {
      if (!response.ok) throw new Error(`Не удалось загрузить ${path}: HTTP ${response.status}`);
      return response.json();
    });
    request.catch(() => cache.delete(path)); // после ошибки можно повторить запрос
    cache.set(path, request);
  }
  return cache.get(path);
}

export const loadGames = () => loadJSON("data/games.json");
