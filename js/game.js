// Страница игры: один шаблон, игра выбирается по параметру адреса game.html?id=...
import { loadGames, loadJSON } from "./data.js";
import { createCover, createGameCard, createWishButton } from "./game-card.js";
import { openQuickView } from "./quick-view.js";
import { openModal } from "./modal.js";
import { formatPrice, formatPct, formatInt, formatDate, balanceLabel, NO_DATA } from "./format.js";

const root = document.querySelector("[data-game]");
const $ = (sel) => root.querySelector(sel);

function setText(sel, text) { $(sel).textContent = text; }

function showMessage(kind, text, withLink = true) {
  const box = $("[data-status]");
  box.hidden = false;
  box.className = `state state--${kind}`;
  box.replaceChildren();
  const p = document.createElement("p");
  p.className = "state__text";
  p.textContent = text;
  box.append(p);
  if (withLink) {
    const a = document.createElement("a");
    a.className = "button";
    a.href = "catalog.html";
    a.textContent = "Перейти в каталог";
    box.append(a);
  }
  $("[data-article]").hidden = true;
}

const signed = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${String(Math.abs(n)).replace(".", ",")}`;

/** 2–3 предложения-вывода строятся скриптом по данным этой игры и агрегатам prices.json. */
function buildFindings(game, prices) {
  const out = [];
  const bin = prices.bins.find((b) => b.bin === game.priceBin);
  if (bin && typeof bin.medianPctPos === "number" && typeof game.pctPos === "number") {
    const diff = Math.round((game.pctPos - bin.medianPctPos) * 10) / 10;
    const rel = Math.abs(diff) < 1 ? "почти не отличается от медианы" : `${diff > 0 ? "выше" : "ниже"} медианы`;
    out.push(`Игра относится к ценовому диапазону «${game.priceBin}»: медианная доля положительных отзывов в нём по выборке — ${formatPct(bin.medianPctPos)}, у этой игры ${formatPct(game.pctPos)}, то есть она ${rel} (разница ${signed(diff)} п. п.).`);
  }
  const y = prices.byYear.find((r) => r.year === game.year);
  if (y) {
    out.push(`Среди всех ${formatInt(y.n)} игр ${game.year} года, у которых в наборе не меньше 50 отзывов (это не только выборка), медианная доля положительных отзывов равна ${formatPct(y.medianPctPos)}.`);
  }
  if (typeof game.playtimeH === "number" && game.playtimeH > 0) {
    const h = String(game.playtimeH).replace(".", ",");
    const cost = game.price > 0 ? ` При цене ${formatPrice(game.price)} это примерно ${String((game.price / game.playtimeH).toFixed(2)).replace(".", ",")} $ за час игры.` : " Игра бесплатна.";
    out.push(`По данным набора, игроки в среднем проводят в игре около ${h} ч.${cost} Это среднее время игры, а не время прохождения.`);
  }
  return out;
}

function similar(game, games) {
  const mine = new Set(game.genres || []);
  return games
    .filter((g) => g.id !== game.id && g.priceBin === game.priceBin)
    .map((g) => ({ g, shared: (g.genres || []).filter((x) => mine.has(x)).length }))
    .filter((x) => !mine.size || x.shared > 0)
    .sort((a, b) => b.shared - a.shared || Math.abs(a.g.year - game.year) - Math.abs(b.g.year - game.year) || b.g.reviews - a.g.reviews)
    .slice(0, 3)
    .map((x) => x.g);
}

function badge(text, mod) {
  const li = document.createElement("li");
  li.className = `badge-list__item${mod ? ` badge-list__item--${mod}` : ""}`;
  li.textContent = text;
  return li;
}

function openShot(game, url, index, trigger) {
  openModal({
    title: `Скриншот ${index + 1}: ${game.name}`,
    trigger,
    wide: true,
    fill(body) {
      const img = document.createElement("img");
      img.className = "modal__shot";
      img.src = url;
      img.alt = `Скриншот ${index + 1} игры «${game.name}»`;
      img.addEventListener("error", () => { img.replaceWith(Object.assign(document.createElement("p"), { textContent: "Скриншот не загрузился." })); }, { once: true });
      body.append(img);
    },
  });
}

function render(game, games, prices) {
  document.title = `${game.name} — Steam Games Market`;
  document.querySelector('meta[name="description"]')?.setAttribute("content",
    `${game.name}: цена ${formatPrice(game.price)}, доля положительных отзывов ${formatPct(game.pctPos)} по выборке из набора данных за март 2025 года.`);

  setText("[data-title]", game.name);
  setText("[data-price]", formatPrice(game.price));
  setText("[data-date]", `Дата выхода: ${formatDate(game.date)}`);
  setText("[data-genres]", game.genres && game.genres.length ? `Жанры: ${game.genres.join(", ")}` : "Жанры: нет данных");
  setText("[data-desc]", game.desc || "Описание в наборе данных отсутствует.");
  $("[data-cover]").replaceWith(Object.assign(createCover(game), { className: "game-hero__cover" }));
  $("[data-wish]").replaceChildren(createWishButton(game, (m) => { $("[data-live]").textContent = m; }));

  const platforms = $("[data-platforms]");
  for (const p of game.platforms || []) platforms.append(badge(p));
  if (!(game.platforms || []).length) platforms.append(badge(NO_DATA));
  platforms.append(badge(game.ru ? "Русский язык: интерфейс и субтитры" : "Русского языка нет", game.ru ? "ru" : ""));
  if (game.ruAudio) platforms.append(badge("Русская озвучка", "ru"));

  setText("[data-pct]", formatPct(game.pctPos));
  $("[data-fill]").style.width = `${Math.max(0, Math.min(100, game.pctPos || 0))}%`;
  $("[data-bar]").setAttribute("aria-label", `Положительных отзывов: ${formatPct(game.pctPos)}`);
  setText("[data-reviews]", `${formatInt(game.reviews)} отзывов`);
  setText("[data-balance]", `${balanceLabel(game.balance)}, индекс баланса ${typeof game.balance === "number" ? signed(game.balance) : NO_DATA}`);

  const list = $("[data-findings]");
  for (const text of buildFindings(game, prices)) {
    const li = document.createElement("li");
    li.textContent = text;
    list.append(li);
  }

  const shots = (game.shots || []).slice(0, 3);
  const gallery = $("[data-gallery]");
  if (!shots.length) gallery.hidden = true;
  shots.forEach((url, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery__item";
    btn.setAttribute("aria-label", `Открыть скриншот ${i + 1} в увеличенном виде`);
    const img = document.createElement("img");
    img.src = url; img.alt = ""; img.loading = "lazy"; img.width = 320; img.height = 180;
    img.addEventListener("error", () => { li.hidden = true; }, { once: true });
    btn.append(img);
    btn.addEventListener("click", () => openShot(game, url, i, btn));
    li.append(btn);
    gallery.append(li);
  });

  const sim = similar(game, games);
  const simList = $("[data-similar]");
  if (!sim.length) {
    $("[data-similar-section]").hidden = true;
  } else {
    simList.replaceChildren(...sim.map((g) => createGameCard(g, (m) => { $("[data-live]").textContent = m; }, openQuickView)));
  }
  $("[data-article]").hidden = false;
  $("[data-status]").hidden = true;
}

async function init() {
  const id = Number(new URLSearchParams(location.search).get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    showMessage("empty", "Игра не выбрана. Откройте её из каталога.");
    return;
  }
  const status = $("[data-status]");
  status.hidden = false;
  status.className = "state state--loading";
  status.innerHTML = '<p class="state__text">Загружаем игру…</p>';
  try {
    const [games, prices] = await Promise.all([loadGames(), loadJSON("data/prices.json")]);
    const game = games.find((g) => g.id === id);
    if (!game) { showMessage("empty", "Игра с таким номером не найдена в выборке."); return; }
    render(game, games, prices);
  } catch (error) {
    console.error(error);
    showMessage("error", "Не удалось загрузить данные. Проверьте соединение и обновите страницу.", false);
  }
}

init();
