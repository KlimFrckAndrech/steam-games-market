// Каталог: поиск, фильтры, сортировка, пагинация. Состояние хранится в объекте state и отражается в адресе.
import { loadGames } from "./data.js";
import { createGameCard } from "./game-card.js";
import { formatInt } from "./format.js";
import { openQuickView } from "./quick-view.js";

const PAGE_SIZE = 12;
const root = document.querySelector("[data-catalog]");
const $ = (sel) => root.querySelector(sel);

const SORTS = {
  reviews: { label: "Больше отзывов", fn: (a, b) => b.reviews - a.reviews },
  rating: { label: "Выше доля положительных", fn: (a, b) => b.pctPos - a.pctPos || b.reviews - a.reviews },
  new: { label: "Сначала новые", fn: (a, b) => b.date.localeCompare(a.date) },
  old: { label: "Сначала старые", fn: (a, b) => a.date.localeCompare(b.date) },
  cheap: { label: "Сначала дешёвые", fn: (a, b) => a.price - b.price },
  pricey: { label: "Сначала дорогие", fn: (a, b) => b.price - a.price },
  name: { label: "По названию", fn: (a, b) => a.name.localeCompare(b.name, "ru") },
};

const state = { q: "", bin: "", genre: "", ru: false, platforms: [], from: 0, to: 9999, sort: "reviews", page: 1 };
let games = [];
let filtered = [];

const dom = {
  status: $("[data-status]"), grid: $("[data-grid]"), count: $("[data-count]"), pager: $("[data-pager]"),
  sort: $("[data-sort]"), search: document.getElementById("search"), form: $("[data-filters]"),
  live: $("[data-live]"),
};

function setStatus(kind, message, retry) {
  dom.status.replaceChildren();
  dom.status.hidden = !kind;
  dom.status.className = `state${kind ? ` state--${kind}` : ""}`;
  if (!kind) return;
  const p = document.createElement("p");
  p.className = "state__text";
  p.textContent = message;
  dom.status.append(p);
  if (retry) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "button state__retry";
    b.textContent = "Повторить";
    b.addEventListener("click", retry);
    dom.status.append(b);
  }
}

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  filtered = games.filter((g) =>
    (!q || g.name.toLowerCase().includes(q)) &&
    (!state.bin || g.priceBin === state.bin) &&
    (!state.genre || (g.genres || []).includes(state.genre)) &&
    (!state.ru || g.ru) &&
    state.platforms.every((p) => g.platforms.includes(p)) &&
    g.year >= state.from && g.year <= state.to
  ).sort(SORTS[state.sort].fn);
}

function renderPager(pages) {
  dom.pager.replaceChildren();
  if (pages <= 1) return;
  const add = (label, page, { current = false, disabled = false, aria } = {}) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pagination__button";
    b.textContent = label;
    if (aria) b.setAttribute("aria-label", aria);
    if (current) b.setAttribute("aria-current", "page");
    b.disabled = disabled;
    b.addEventListener("click", () => { state.page = page; render(true); });
    li.append(b);
    dom.pager.append(li);
  };
  add("←", state.page - 1, { disabled: state.page === 1, aria: "Предыдущая страница" });
  const shown = new Set([1, pages, state.page - 1, state.page, state.page + 1]);
  let last = 0;
  for (let p = 1; p <= pages; p++) {
    if (!shown.has(p)) continue;
    if (p - last > 1) {
      const gap = document.createElement("li");
      gap.className = "pagination__gap";
      gap.textContent = "…";
      dom.pager.append(gap);
    }
    add(String(p), p, { current: p === state.page, aria: `Страница ${p}` });
    last = p;
  }
  add("→", state.page + 1, { disabled: state.page === pages, aria: "Следующая страница" });
}

function render(scroll = false) {
  applyFilters();
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const slice = filtered.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

  dom.grid.replaceChildren(...slice.map((g) => createGameCard(g, announce, openQuickView)));
  dom.count.textContent = `Найдено игр: ${formatInt(filtered.length)} из ${formatInt(games.length)}`;
  if (!filtered.length) setStatus("empty", "Под эти условия ничего не подошло. Смягчите фильтры или сбросьте их.");
  else setStatus(null);
  renderPager(filtered.length ? pages : 0);
  if (scroll) dom.count.scrollIntoView({ behavior: "smooth", block: "start" });
}

function announce(message) {
  dom.live.textContent = "";
  requestAnimationFrame(() => { dom.live.textContent = message; });
}

function fillOptions() {
  const bins = [...new Set(games.map((g) => g.priceBin))];
  const order = ["Бесплатно", "до 5", "5–10", "10–20", "20–40", "от 40"];
  bins.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const binSel = $("[data-bin]");
  for (const b of bins) binSel.append(new Option(b === "Бесплатно" ? b : `${b} $`, b));

  const counts = new Map();
  for (const g of games) for (const x of g.genres || []) counts.set(x, (counts.get(x) || 0) + 1);
  const genreSel = $("[data-genre]");
  for (const [name] of [...counts].sort((a, b) => b[1] - a[1])) genreSel.append(new Option(name, name));

  const years = games.map((g) => g.year);
  const min = Math.min(...years), max = Math.max(...years);
  for (const sel of [$("[data-from]"), $("[data-to]")]) {
    for (let y = min; y <= max; y++) sel.append(new Option(String(y), String(y)));
  }
  state.from = min; state.to = max;
  $("[data-from]").value = String(min);
  $("[data-to]").value = String(max);

  for (const [key, s] of Object.entries(SORTS)) dom.sort.append(new Option(s.label, key));
}

function bind() {
  let timer;
  dom.search.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.q = dom.search.value; state.page = 1; render(); }, 200);
  });
  dom.search.form?.addEventListener("submit", (e) => e.preventDefault());
  $("[data-bin]").addEventListener("change", (e) => { state.bin = e.target.value; state.page = 1; render(); });
  $("[data-genre]").addEventListener("change", (e) => { state.genre = e.target.value; state.page = 1; render(); });
  $("[data-ru]").addEventListener("change", (e) => { state.ru = e.target.checked; state.page = 1; render(); });
  root.querySelectorAll("[data-platform]").forEach((cb) => cb.addEventListener("change", () => {
    state.platforms = [...root.querySelectorAll("[data-platform]:checked")].map((x) => x.value);
    state.page = 1; render();
  }));
  const years = () => {
    state.from = Number($("[data-from]").value);
    state.to = Number($("[data-to]").value);
    const note = $("[data-year-note]");
    note.textContent = state.from > state.to ? "Начальный год позже конечного: игр не найдено." : "";
    state.page = 1; render();
  };
  $("[data-from]").addEventListener("change", years);
  $("[data-to]").addEventListener("change", years);
  dom.sort.addEventListener("change", (e) => { state.sort = e.target.value; state.page = 1; render(); });
  $("[data-reset]").addEventListener("click", () => {
    dom.form.reset();
    dom.search.value = "";
    Object.assign(state, { q: "", bin: "", genre: "", ru: false, platforms: [], sort: "reviews", page: 1 });
    $("[data-from]").value = String(Math.min(...games.map((g) => g.year)));
    $("[data-to]").value = String(Math.max(...games.map((g) => g.year)));
    state.from = Number($("[data-from]").value); state.to = Number($("[data-to]").value);
    dom.sort.value = "reviews";
    render();
  });

  const toggle = $("[data-filters-toggle]");
  const panel = document.getElementById("filters-panel");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("filters__panel--open", open);
  });
}

async function init() {
  setStatus("loading", "Загружаем игры…");
  try {
    games = await loadGames();
  } catch (error) {
    console.error(error);
    setStatus("error", "Не удалось загрузить данные. Проверьте соединение и повторите попытку.", init);
    return;
  }
  if (!root.dataset.ready) { fillOptions(); bind(); root.dataset.ready = "1"; }
  render();
}

init();
