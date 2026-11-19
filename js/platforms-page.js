// Страница «Платформы и русская локализация»: два графика по platforms.json.
import { loadJSON, loadGames } from "./data.js";
import { mountChart, chartDefaults, chartReady, fillTable, noChartNotice } from "./charts.js";
import { formatPct, formatInt } from "./format.js";

const root = document.querySelector("[data-platforms-page]");
const fig = (name) => root.querySelector(`[data-fig="${name}"]`);
const comma = (n) => (typeof n === "number" ? n.toFixed(1).replace(".", ",") : "нет данных");

function renderPlatforms(counts, total) {
  const f = fig("platforms");
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const share = (n) => Math.round((n / total) * 1000) / 10;
  f.querySelector("[data-caption]").textContent = entries.map(([k, v]) => `${k}: ${formatInt(v)} игр (${formatPct(share(v))})`).join("; ") + ` — из ${formatInt(total)} игр выборки.`;
  fillTable(f.querySelector("table"), ["Платформа", "Игр в выборке", "Доля выборки, %"], entries.map(([k, v]) => [k, formatInt(v), comma(share(v))]));
  if (!chartReady()) return noChartNotice(f);
  mountChart(f.querySelector("canvas"), (c) => {
    const d = chartDefaults(c);
    return {
      type: "bar",
      data: { labels: entries.map(([k]) => k), datasets: [{ label: "Число игр", data: entries.map(([, v]) => v), backgroundColor: c.c1 }] },
      options: { indexAxis: "y", plugins: { ...d.plugins, tooltip: { callbacks: { afterLabel: (ctx) => `${formatPct(share(entries[ctx.dataIndex][1]))} выборки` } } },
        scales: { x: { ...d.scales.x, title: { display: true, text: "Число игр", color: c.muted } }, y: d.scales.y } },
    };
  });
}

function renderRu(rows, medians) {
  const f = fig("ru");
  const top = rows.reduce((a, b) => (b.shareRu > a.shareRu ? b : a));
  const low = rows.reduce((a, b) => (b.shareRu < a.shareRu ? b : a));
  f.querySelector("[data-caption]").textContent =
    `Доля игр с русским языком по годам выхода: от ${formatPct(Math.round(low.shareRu * 1000) / 10)} (${low.year}) до ${formatPct(Math.round(top.shareRu * 1000) / 10)} (${top.year}). Медианная доля положительных отзывов: с русским языком ${formatPct(medians.withRu)}, без него ${formatPct(medians.withoutRu)}.`;
  fillTable(f.querySelector("table"), ["Год выхода", "Игр в выборке", "Доля игр с русским языком, %"],
    rows.map((r) => [String(r.year), formatInt(r.n), comma(Math.round(r.shareRu * 1000) / 10)]));
  if (!chartReady()) return noChartNotice(f);
  mountChart(f.querySelector("canvas"), (c) => {
    const d = chartDefaults(c);
    return {
      data: {
        labels: rows.map((r) => String(r.year)),
        datasets: [{ type: "line", label: "Доля игр с русским языком, %", data: rows.map((r) => Math.round(r.shareRu * 1000) / 10), borderColor: c.c1, backgroundColor: c.c1, tension: 0.25, pointRadius: 3 }],
      },
      options: { plugins: d.plugins, scales: { x: d.scales.x, y: { ...d.scales.y, min: 0, max: 100, title: { display: true, text: "%", color: c.muted } } } },
    };
  });
}

async function init() {
  const status = root.querySelector("[data-status]");
  try {
    const [data, games] = await Promise.all([loadJSON("data/platforms.json"), loadGames()]);
    status.hidden = true;
    renderPlatforms(data.counts, games.length);
    renderRu(data.ruByYear, data.medianPctPos);
  } catch (error) {
    console.error(error);
    status.hidden = false;
    status.className = "state state--error";
    status.textContent = "Не удалось загрузить данные для графиков. Обновите страницу.";
  }
}

init();
