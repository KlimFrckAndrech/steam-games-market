// Карточка игры для каталога и витрин. DOM собирается через textContent: данные не попадают в разметку как HTML.
import { formatPrice, formatPct, formatInt, COVER_PLACEHOLDER, NO_DATA } from "./format.js";
import { isWished, toggleWish } from "./wishlist.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createCover(game) {
  const img = el("img", "game-card__cover");
  img.src = game.cover;
  img.alt = `Обложка игры «${game.name}»`;
  img.width = 460;
  img.height = 215;
  img.loading = "lazy";
  img.decoding = "async";
  // Если Steam не отдал обложку, показываем заглушку (один раз, чтобы не зациклиться)
  img.addEventListener("error", () => {
    if (!img.src.endsWith(COVER_PLACEHOLDER)) img.src = COVER_PLACEHOLDER;
  }, { once: true });
  return img;
}

export function wishLabel(game, wished) {
  return wished ? `Убрать «${game.name}» из списка желаемого` : `Добавить «${game.name}» в список желаемого`;
}

export function createWishButton(game, onMessage) {
  const btn = el("button", "button button--outline game-card__wish");
  btn.type = "button";
  const sync = () => {
    const wished = isWished(game.id);
    btn.setAttribute("aria-pressed", String(wished));
    btn.setAttribute("aria-label", wishLabel(game, wished));
    btn.textContent = wished ? "В списке" : "В список";
  };
  btn.addEventListener("click", () => {
    const result = toggleWish(game.id);
    if (!result.ok && onMessage) onMessage(result.reason);
    sync();
  });
  document.addEventListener("wishlist:change", sync);
  sync();
  return btn;
}

export function createGameCard(game, onMessage) {
  const card = el("li", "game-card");
  const link = el("a", "game-card__cover-link");
  link.href = `game.html?id=${game.id}`;
  link.tabIndex = -1;
  link.setAttribute("aria-hidden", "true");
  link.append(createCover(game));

  const body = el("div", "game-card__body");
  const title = el("h3", "game-card__title");
  const titleLink = el("a", "game-card__link", game.name);
  titleLink.href = `game.html?id=${game.id}`;
  title.append(titleLink);

  const meta = el("p", "game-card__meta",
    `${game.year} · ${game.genres && game.genres.length ? game.genres.slice(0, 2).join(", ") : "жанр не указан"}`);

  const price = el("p", "game-card__price", formatPrice(game.price));

  const score = el("div", "game-card__score");
  const bar = el("div", "game-card__bar");
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", typeof game.pctPos === "number" ? `Положительных отзывов: ${formatPct(game.pctPos)}` : NO_DATA);
  const fill = el("div", "game-card__bar-fill");
  fill.style.width = `${Math.max(0, Math.min(100, game.pctPos || 0))}%`;
  bar.append(fill);
  const scoreText = el("p", "game-card__score-text", `${formatPct(game.pctPos)} положительных · ${formatInt(game.reviews)} отзывов`);
  score.append(bar, scoreText);

  const badges = el("ul", "game-card__badges");
  for (const p of game.platforms || []) badges.append(el("li", "game-card__badge", p));
  if (game.ru) badges.append(el("li", "game-card__badge game-card__badge--ru", "Русский язык"));

  const actions = el("div", "game-card__actions");
  const more = el("a", "button game-card__more", "Подробнее");
  more.href = `game.html?id=${game.id}`;
  more.setAttribute("aria-label", `Подробнее об игре «${game.name}»`);
  actions.append(more, createWishButton(game, onMessage));

  body.append(title, meta, price, score, badges, actions);
  card.append(link, body);
  return card;
}
