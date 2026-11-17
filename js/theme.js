// Переключатель темы: меняет data-theme на <html>, выбор хранится в localStorage.
// Начальную тему до отрисовки ставит короткий скрипт в <head> каждой страницы (нет мигания).
const KEY = "theme";

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "dark";
  } catch {
    return "dark"; // localStorage может быть недоступен (приватный режим)
  }
}

function apply(theme, button) {
  document.documentElement.dataset.theme = theme;
  const isLight = theme === "light";
  button.setAttribute("aria-pressed", String(isLight));
  button.querySelector(".theme-toggle__icon").textContent = isLight ? "☀" : "☾";
  button.querySelector(".theme-toggle__label").textContent = isLight ? "Светлая тема" : "Тёмная тема";
}

export function initTheme() {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;
  apply(read(), button);
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    apply(next, button);
    try { localStorage.setItem(KEY, next); } catch { /* без сохранения */ }
  });
}
