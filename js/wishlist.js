// Список желаемого = избранное (решение С3): до 10 игр, ключ wishlist в localStorage.
const KEY = "wishlist";
export const MAX_ITEMS = 10;

let memory = []; // запасной вариант, если localStorage недоступен

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter(Number.isInteger).slice(0, MAX_ITEMS) : [];
  } catch {
    return memory;
  }
}

function write(ids) {
  memory = ids;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* только в памяти */ }
  document.dispatchEvent(new CustomEvent("wishlist:change", { detail: ids }));
}

export const getWishlist = () => read();
export const isWished = (id) => read().includes(id);

/** Добавляет или убирает игру. Возвращает { ok, wished, reason }. */
export function toggleWish(id) {
  const ids = read();
  if (ids.includes(id)) {
    write(ids.filter((x) => x !== id));
    return { ok: true, wished: false };
  }
  if (ids.length >= MAX_ITEMS) return { ok: false, wished: false, reason: `В списке не больше ${MAX_ITEMS} игр. Уберите одну, чтобы добавить новую.` };
  write([...ids, id]);
  return { ok: true, wished: true };
}
