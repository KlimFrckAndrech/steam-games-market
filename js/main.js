import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";

initTheme();
initNav();

if (document.querySelector("[data-catalog]")) import("./catalog.js");
