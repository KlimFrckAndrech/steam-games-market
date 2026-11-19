// Страница «Цена и отзывы»: три графика по prices.json и динамические подписи.
import { loadJSON } from "./data.js";
import { mountChart, chartDefaults, chartReady, fillTable, noChartNotice } from "./charts.js";
import { formatPct, formatInt } from "./format.js";

const root = document.querySelector("[data-prices]");
const fig = (name) => root.querySelector(`[data-fig="${name}"]`);
const comma = (n) => (typeof n === "number" ? n.toFixed(1).replace(".", ",") : "нет данных");
const pct = (n) => formatPct(n);

function setCaption(name, text) { fig(name).querySelector("[data-caption]").textContent = text; }

const binName = (b) => (b === "Бесплатно" ? "Бесплатно" : `${b} $`);

function renderBins(bins) {
  const f = fig("bins");
  const valid = bins.filter((b) => typeof b.medianPctPos === "number");
  const top = valid.reduce((a, b) => (b.medianPctPos > a.medianPctPos ? b : a));
  const low = valid.reduce((a, b) => (b.medianPctPos < a.medianPctPos ? b : a));
  setCaption("bins", `Выше всего медиана в диапазоне «${binName(top.bin)}» (${pct(top.medianPctPos)}, ${formatInt(top.n)} игр выборки), ниже всего — в диапазоне «${binName(low.bin)}» (${pct(low.medianPctPos)}, ${formatInt(low.n)} игр). Разница между крайними диапазонами — ${comma(top.medianPctPos - low.medianPctPos)} п. п.`);
  fillTable(f.querySelector("table"), ["Ценовой диапазон", "Игр в выборке", "Медианная доля положительных, %"],
    bins.map((b) => [b.bin === "Бесплатно" ? b.bin : `${b.bin} $`, formatInt(b.n), comma(b.medianPctPos)]));
  if (!chartReady()) return noChartNotice(f);
  mountChart(f.querySelector("canvas"), (c) => {
    const d = chartDefaults(c);
    return {
      type: "bar",
      data: { labels: bins.map((b) => (b.bin === "Бесплатно" ? b.bin : `${b.bin} $`)), datasets: [{ label: "Медианная доля положительных отзывов, %", data: bins.map((b) => b.medianPctPos), backgroundColor: c.c1 }] },
      options: { plugins: { ...d.plugins, tooltip: { callbacks: { afterLabel: (ctx) => `Игр в выборке: ${formatInt(bins[ctx.dataIndex].n)}` } } },
        scales: { x: d.scales.x, y: { ...d.scales.y, min: 60, max: 100, title: { display: true, text: "%", color: c.muted } } } },
    };
  });
}

function renderYears(rows, size) {
  const f = fig("years");
  const first = rows[0], last = rows[rows.length - 1];
  setCaption("years", `Среди всех ${formatInt(size)} игр набора с не менее чем 50 отзывами на ${first.year} год приходится ${formatInt(first.n)} игр, на ${last.year} год — ${formatInt(last.n)}; медианная доля положительных отзывов за это время изменилась с ${pct(first.medianPctPos)} до ${pct(last.medianPctPos)}.`);
  fillTable(f.querySelector("table"), ["Год выхода", "Игр с ≥ 50 отзывами", "Медианная доля положительных, %", "Медианная цена, $"],
    rows.map((r) => [String(r.year), formatInt(r.n), comma(r.medianPctPos), comma(r.medianPrice)]));
  if (!chartReady()) return noChartNotice(f);
  mountChart(f.querySelector("canvas"), (c) => {
    const d = chartDefaults(c);
    return {
      data: {
        labels: rows.map((r) => String(r.year)),
        datasets: [
          { type: "bar", label: "Игр с ≥ 50 отзывами", data: rows.map((r) => r.n), backgroundColor: c.c1, yAxisID: "y" },
          { type: "line", label: "Медианная доля положительных, %", data: rows.map((r) => r.medianPctPos), borderColor: c.c2, backgroundColor: c.c2, yAxisID: "y1", tension: 0.25, pointRadius: 3 },
        ],
      },
      options: { plugins: d.plugins, scales: {
        x: d.scales.x,
        y: { ...d.scales.y, title: { display: true, text: "Число игр", color: c.muted } },
        y1: { position: "right", min: 60, max: 100, ticks: { color: c.muted }, grid: { drawOnChartArea: false }, title: { display: true, text: "%", color: c.muted } },
      } },
    };
  });
}

function renderGenres(rows) {
  const f = fig("genres");
  const top = rows.reduce((a, b) => (b.medianPctPos > a.medianPctPos ? b : a));
  const low = rows.reduce((a, b) => (b.medianPctPos < a.medianPctPos ? b : a));
  setCaption("genres", `Среди ${rows.length} самых крупных жанров выше всего медианная доля положительных отзывов у жанра ${top.genre} (${pct(top.medianPctPos)}), ниже всего — у жанра ${low.genre} (${pct(low.medianPctPos)}).`);
  fillTable(f.querySelector("table"), ["Жанр", "Игр с ≥ 50 отзывами", "Медианная доля положительных, %", "Медианная цена, $"],
    rows.map((r) => [r.genre, formatInt(r.n), comma(r.medianPctPos), comma(r.medianPrice)]));
  if (!chartReady()) return noChartNotice(f);
  mountChart(f.querySelector("canvas"), (c) => {
    const d = chartDefaults(c);
    return {
      type: "bar",
      data: { labels: rows.map((r) => r.genre), datasets: [{ label: "Медианная доля положительных отзывов, %", data: rows.map((r) => r.medianPctPos), backgroundColor: c.c1 }] },
      options: { indexAxis: "y", plugins: { ...d.plugins, tooltip: { callbacks: { afterLabel: (ctx) => `Игр: ${formatInt(rows[ctx.dataIndex].n)}` } } },
        scales: { x: { ...d.scales.x, min: 60, max: 100, title: { display: true, text: "%", color: c.muted } }, y: d.scales.y } },
    };
  });
}

async function init() {
  const status = root.querySelector("[data-status]");
  try {
    const prices = await loadJSON("data/prices.json");
    status.hidden = true;
    renderBins(prices.bins);
    renderYears(prices.byYear, prices.universeSize);
    renderGenres(prices.byGenre);
  } catch (error) {
    console.error(error);
    status.hidden = false;
    status.className = "state state--error";
    status.textContent = "Не удалось загрузить данные для графиков. Обновите страницу.";
  }
}

init();
