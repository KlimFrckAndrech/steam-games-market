// Счётчик игр в списке желаемого рядом со ссылкой в шапке.
import { getWishlist } from "./wishlist.js";

export function initWishlistBadge() {
  const link = document.querySelector('.header__link[href="wishlist.html"]');
  if (!link) return;
  const badge = document.createElement("span");
  badge.className = "header__badge";
  badge.setAttribute("aria-hidden", "true");
  const hint = document.createElement("span");
  hint.className = "visually-hidden";
  link.append(badge, hint);
  const update = () => {
    const n = getWishlist().length;
    badge.textContent = String(n);
    badge.hidden = n === 0;
    hint.textContent = n ? `, игр в списке: ${n}` : "";
  };
  document.addEventListener("wishlist:change", update);
  update();
}
