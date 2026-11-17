// Мобильное меню: кнопка-бургер, aria-expanded, закрытие по Esc.
export function initNav() {
  const burger = document.querySelector("[data-burger]");
  const nav = document.getElementById("site-nav");
  if (!burger || !nav) return;

  const set = (open) => {
    nav.classList.toggle("header__nav--open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  };
  burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
      set(false);
      burger.focus();
    }
  });
}
