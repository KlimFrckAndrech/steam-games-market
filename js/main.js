import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initInfoModals } from "./modal-info.js";

initTheme();
initNav();
initInfoModals();

if (document.querySelector("[data-catalog]")) import("./catalog.js");
if (document.querySelector("[data-game]")) import("./game.js");
if (document.querySelector("[data-prices]")) import("./prices-page.js");
if (document.querySelector("[data-platforms-page]")) import("./platforms-page.js");
if (document.querySelector("[data-home]")) import("./home.js");
if (document.querySelector("[data-wishlist]")) import("./wishlist-page.js");
