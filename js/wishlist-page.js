// Список желаемого и калькулятор.
// Цена со скидкой = цена × (1 − скидка / 100); итог = сумма цен со скидкой;
// стоимость часа = цена со скидкой / среднее время игры в часах.
import { loadGames } from "./data.js";
import { getWishlist, toggleWish, MAX_ITEMS } from "./wishlist.js";
import { createCover } from "./game-card.js";
import { openModal } from "./modal.js";
import { formatPrice, formatInt } from "./format.js";

const root = document.querySelector("[data-wishlist]");
const $ = (sel) => root.querySelector(sel);
const CALC_KEY = "wishlist-calc"; // { id: { d: скидка %, h: часы } }

let games = [];

function readCalc() {
  try { return JSON.parse(localStorage.getItem(CALC_KEY) || "{}") || {}; } catch { return {}; }
}
function writeCalc(v) {
  try { localStorage.setItem(CALC_KEY, JSON.stringify(v)); } catch { /* без сохранения */ }
}

const money = (n) => `${n.toFixed(2).replace(".", ",")} $`;
const clampDiscount = (v) => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function field(labelText, input, id) {
  const wrap = el("div", "wish-item__field");
  const label = el("label", "wish-item__label", labelText);
  label.htmlFor = id;
  input.id = id;
  wrap.append(label, input);
  return wrap;
}

function numberInput(value, { min, max, step }) {
  const i = el("input", "field__control");
  i.type = "number"; i.inputMode = "decimal";
  i.min = min; i.max = max; i.step = step;
  if (value !== undefined && value !== "") i.value = value;
  return i;
}

function compute(game, calc) {
  const d = clampDiscount(Number(calc.d));
  const final = game.price * (1 - d / 100);
  const hours = Number(calc.h);
  const perHour = hours > 0 && final > 0 ? final / hours : null;
  return { d, final, hours: hours > 0 ? hours : null, perHour };
}

function totals() {
  const calc = readCalc();
  let sum = 0, full = 0;
  const rows = [];
  for (const id of getWishlist()) {
    const g = games.find((x) => x.id === id);
    if (!g) continue;
    const r = compute(g, calc[id] || {});
    sum += r.final; full += g.price;
    rows.push({ g, ...r });
  }
  return { sum, full, rows };
}

function renderTotals() {
  const { sum, full, rows } = totals();
  $("[data-sum]").textContent = money(sum);
  $("[data-saving]").textContent = money(Math.max(0, full - sum));
  $("[data-count]").textContent = `${rows.length} из ${MAX_ITEMS}`;
  $("[data-summary-btn]").disabled = rows.length === 0;
}

function renderItem(game, calc) {
  const item = el("li", "wish-item");
  const saved = calc[game.id] || {};
  const cover = createCover(game);
  cover.className = "wish-item__cover";

  const head = el("div", "wish-item__head");
  const title = el("h3", "wish-item__title");
  const link = el("a", "wish-item__link", game.name);
  link.href = `game.html?id=${game.id}`;
  title.append(link);
  head.append(title, el("p", "wish-item__price", `Цена: ${formatPrice(game.price)}`));

  const discount = numberInput(saved.d ?? "", { min: 0, max: 100, step: 1 });
  discount.placeholder = "0";
  const hours = numberInput(saved.h ?? (typeof game.playtimeH === "number" ? game.playtimeH : ""), { min: 0, max: 100000, step: 0.1 });
  hours.placeholder = "нет данных";

  const result = el("p", "wish-item__result");
  const update = () => {
    const calcAll = readCalc();
    calcAll[game.id] = { d: discount.value, h: hours.value };
    writeCalc(calcAll);
    const r = compute(game, calcAll[game.id]);
    result.textContent = `Со скидкой: ${money(r.final)}. ` + (game.price === 0 ? "Игра бесплатна." : r.perHour === null ? "Стоимость часа: нет данных (укажите время игры)." : `Стоимость часа: ${money(r.perHour)}.`);
    renderTotals();
  };
  discount.addEventListener("input", update);
  hours.addEventListener("input", update);

  const remove = el("button", "button button--outline wish-item__remove", "Убрать");
  remove.type = "button";
  remove.setAttribute("aria-label", `Убрать «${game.name}» из списка желаемого`);
  remove.addEventListener("click", () => {
    const list = item.parentElement;
    toggleWish(game.id);
    item.remove();
    if (!list.children.length) { render(); $("[data-empty]").focus(); return; }
    renderTotals();
    list.querySelector(".wish-item__remove")?.focus();
  });

  const fields = el("div", "wish-item__fields");
  fields.append(field("Скидка, %", discount, `d-${game.id}`), field("Среднее время игры, ч", hours, `h-${game.id}`));
  item.append(cover, head, fields, result, remove);
  update();
  return item;
}

function render() {
  const ids = getWishlist();
  const list = $("[data-list]");
  const empty = $("[data-empty]");
  const calc = readCalc();
  const items = ids.map((id) => games.find((g) => g.id === id)).filter(Boolean);
  list.replaceChildren(...items.map((g) => renderItem(g, calc)));
  empty.hidden = items.length > 0;
  $("[data-calc]").hidden = items.length === 0;
  renderTotals();
}

function openSummary(trigger) {
  const { sum, full, rows } = totals();
  openModal({
    title: "Итог списка желаемого",
    trigger,
    fill(body) {
      const table = el("table", "data-table");
      const head = table.createTHead().insertRow();
      for (const h of ["Игра", "Цена", "Скидка", "Со скидкой"]) head.append(Object.assign(el("th", "", h), { scope: "col" }));
      const tb = table.createTBody();
      for (const r of rows) {
        const tr = tb.insertRow();
        tr.append(Object.assign(el("th", "", r.g.name), { scope: "row" }), el("td", "", formatPrice(r.g.price)), el("td", "", `${r.d} %`), el("td", "", money(r.final)));
      }
      const wrap = el("div", "chart__table-wrap");
      wrap.append(table);
      body.append(wrap);
      body.append(el("p", "modal__total", `Итого: ${money(sum)} (без скидок: ${money(full)}). Игр: ${formatInt(rows.length)}.`));
      body.append(el("p", "", "Покупки на сайте нет, суммы справочные: цены и скидки в Steam зависят от региона и дня."));
    },
  });
}

async function init() {
  const status = $("[data-status]");
  try {
    games = await loadGames();
  } catch (error) {
    console.error(error);
    status.hidden = false;
    status.className = "state state--error";
    status.textContent = "Не удалось загрузить данные. Обновите страницу.";
    return;
  }
  $("[data-clear]").addEventListener("click", () => {
    for (const id of getWishlist()) toggleWish(id);
    render();
  });
  $("[data-summary-btn]").addEventListener("click", (e) => openSummary(e.currentTarget));
  render();
}

init();
