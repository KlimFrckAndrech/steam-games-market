// Общие функции графиков Chart.js: цвета из CSS-переменных текущей темы, перерисовка при смене темы,
// таблица с теми же данными (запасной вариант без Chart.js и вариант для скринридеров).
import { formatPct } from "./format.js";

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const palette = () => ({
  c1: css("--chart-1"), c2: css("--chart-2"),
  text: css("--color-text"), muted: css("--color-muted"), grid: css("--color-border"), surface: css("--color-surface"),
});

export const chartReady = () => typeof window.Chart === "function";

const instances = [];

/** build(colors) возвращает конфигурацию Chart.js; при смене темы график пересоздаётся. */
export function mountChart(canvas, build) {
  const make = () => {
    const colors = palette();
    const config = build(colors);
    config.options = config.options || {};
    config.options.responsive = true;
    config.options.maintainAspectRatio = false;
    const prev = instances.find((i) => i.canvas === canvas);
    if (prev) { prev.chart.destroy(); instances.splice(instances.indexOf(prev), 1); }
    instances.push({ canvas, chart: new window.Chart(canvas, config) });
  };
  make();
  new MutationObserver(make).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

export function chartDefaults(colors) {
  return {
    plugins: { legend: { labels: { color: colors.text } } },
    scales: {
      x: { ticks: { color: colors.muted }, grid: { color: colors.grid } },
      y: { ticks: { color: colors.muted }, grid: { color: colors.grid } },
    },
  };
}

/** Таблица данных графика внутри <details>: доступная альтернатива и запасной вариант. */
export function fillTable(table, headers, rows) {
  table.replaceChildren();
  const thead = table.createTHead().insertRow();
  for (const h of headers) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = h;
    thead.append(th);
  }
  const tbody = table.createTBody();
  for (const row of rows) {
    const tr = tbody.insertRow();
    row.forEach((cell, i) => {
      const td = i === 0 ? document.createElement("th") : document.createElement("td");
      if (i === 0) td.scope = "row";
      td.textContent = cell;
      tr.append(td);
    });
  }
}

export function noChartNotice(figure) {
  const note = figure.querySelector("[data-nochart]");
  if (note) note.hidden = false;
  const details = figure.querySelector("details");
  if (details) details.open = true;
  figure.querySelector(".chart__canvas-box")?.setAttribute("hidden", "");
}

export { formatPct };
