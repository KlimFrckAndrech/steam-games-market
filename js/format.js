// Форматирование значений для интерфейса. Пропуски выводятся как «нет данных».
export const NO_DATA = "нет данных";

const intFormat = new Intl.NumberFormat("ru-RU");

export function formatInt(n) {
  return typeof n === "number" ? intFormat.format(n) : NO_DATA;
}

export function formatPrice(price) {
  if (typeof price !== "number") return NO_DATA;
  if (price === 0) return "Бесплатно";
  return `${price.toFixed(2).replace(".", ",")} $`;
}

export function formatPct(pct) {
  return typeof pct === "number" ? `${String(Math.round(pct * 10) / 10).replace(".", ",")} %` : NO_DATA;
}

export function formatDate(iso) {
  if (!iso) return NO_DATA;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? NO_DATA : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

// Индекс баланса отзывов от −100 до +100 и словесная оценка (шкала согласована с руководителем)
const BALANCE_BANDS = [
  [-60, "Крайне негативное восприятие"],
  [-30, "Выраженное негативное восприятие"],
  [-10, "Умеренное негативное восприятие"],
  [10, "Баланс мнений"],
  [30, "Умеренное позитивное восприятие"],
  [60, "Выраженное позитивное восприятие"],
  [Infinity, "Крайне позитивное восприятие"],
];

export function balanceLabel(balance) {
  if (typeof balance !== "number") return NO_DATA;
  return BALANCE_BANDS.find(([limit]) => balance < limit || limit === Infinity)[1];
}

export const COVER_PLACEHOLDER = "images/cover-placeholder.svg";
