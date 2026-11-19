// Быстрый просмотр игры в модальном окне: название, цена, платформы и доля положительных отзывов.
import { openModal } from "./modal.js";
import { formatPrice, formatPct, formatInt, balanceLabel } from "./format.js";
import { createCover } from "./game-card.js";

export function openQuickView(game, trigger) {
  openModal({
    title: game.name,
    trigger,
    fill(body) {
      const cover = createCover(game);
      cover.className = "modal__cover";
      const list = document.createElement("dl");
      list.className = "modal__facts";
      const rows = [
        ["Цена", formatPrice(game.price)],
        ["Платформы", (game.platforms || []).join(", ") || "нет данных"],
        ["Русский язык", game.ru ? "есть" : "нет"],
        ["Положительных отзывов", `${formatPct(game.pctPos)} (${formatInt(game.reviews)} отзывов)`],
        ["Оценка", balanceLabel(game.balance)],
      ];
      for (const [k, v] of rows) {
        const dt = document.createElement("dt"); dt.textContent = k;
        const dd = document.createElement("dd"); dd.textContent = v;
        list.append(dt, dd);
      }
      const link = document.createElement("a");
      link.className = "button";
      link.href = `game.html?id=${game.id}`;
      link.textContent = "Открыть страницу игры";
      body.append(cover, list, link);
    },
  });
}
