import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initInfoModals } from "./modal-info.js";

initTheme();
initNav();
initInfoModals();

if (document.querySelector("[data-catalog]")) import("./catalog.js");
if (document.querySelector("[data-game]")) import("./game.js");
