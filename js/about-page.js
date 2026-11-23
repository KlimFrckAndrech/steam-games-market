// Страница «О данных»: цифры выборки считаются по games.json.
import { loadGames } from "./data.js";
import { formatInt } from "./format.js";

const root = document.querySelector("[data-about]");

function row(tbody, name, value) {
  const tr = tbody.insertRow();
  const th = document.createElement("th");
  th.scope = "row";
  th.textContent = name;
  tr.append(th, Object.assign(document.createElement("td"), { textContent: value }));
}

async function init() {
  const tbody = root.querySelector("[data-facts]");
  const status = root.querySelector("[data-status]");
  try {
    const games = await loadGames();
    const share = (n) => `${Math.round((n / games.length) * 1000) / 10} %`.replace(".", ",");
    const years = games.map((g) => g.year);
    row(tbody, "Игр в выборке", formatInt(games.length));
    row(tbody, "Годы выхода", `${Math.min(...years)}–${Math.max(...years)}`);
    row(tbody, "Бесплатные игры (цена 0)", `${formatInt(games.filter((g) => g.price === 0).length)} (${share(games.filter((g) => g.price === 0).length)})`);
    row(tbody, "Игры с русским языком", share(games.filter((g) => g.ru).length));
    row(tbody, "Игры с описанием", share(games.filter((g) => g.desc).length));
    row(tbody, "Игры со временем игры", share(games.filter((g) => typeof g.playtimeH === "number").length));
    row(tbody, "Доля пересчитана по числам отзывов", share(games.filter((g) => g.pctSrc === "calc").length));
  } catch (error) {
    console.error(error);
    status.hidden = false;
    status.className = "state state--error";
    status.textContent = "Не удалось загрузить данные выборки.";
  }
}

init();
