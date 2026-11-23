// Главная: число игр выборки, слайдер «Лучшие по отзывам» (Swiper) и сетка «Новинки».
import { loadGames } from "./data.js";
import { createGameCard } from "./game-card.js";
import { openQuickView } from "./quick-view.js";
import { formatInt } from "./format.js";

const MIN_REVIEWS_BEST = 5000; // чтобы в «лучших» не попадали игры с малым числом отзывов
const BEST_COUNT = 10;
const NEW_COUNT = 8;

const root = document.querySelector("[data-home]");
const $ = (sel) => root.querySelector(sel);
const live = $("[data-live]");
const say = (m) => { live.textContent = ""; requestAnimationFrame(() => { live.textContent = m; }); };

function showError(box) {
  box.hidden = false;
  box.className = "state state--error";
  box.textContent = "Не удалось загрузить игры. Обновите страницу.";
}

function initSlider(slider, track) {
  if (typeof window.Swiper === "function") {
    for (const li of track.children) li.classList.add("swiper-slide");
    slider.classList.add("swiper");
    track.classList.add("swiper-wrapper");
    new window.Swiper(slider, {
      slidesPerView: 1.15,
      spaceBetween: 16,
      breakpoints: { 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } },
      navigation: { nextEl: slider.querySelector(".swiper-button-next"), prevEl: slider.querySelector(".swiper-button-prev") },
      keyboard: { enabled: true },
      a11y: { prevSlideMessage: "Предыдущие игры", nextSlideMessage: "Следующие игры" },
    });
  } else {
    // Запасной вариант без Swiper: горизонтальная прокрутка с привязкой к карточкам
    slider.classList.add("slider--plain");
    slider.querySelectorAll(".swiper-button-next, .swiper-button-prev").forEach((b) => b.remove());
  }
}

async function init() {
  const status = $("[data-status]");
  let games;
  try {
    games = await loadGames();
  } catch (error) {
    console.error(error);
    showError(status);
    return;
  }
  $("[data-total]").textContent = formatInt(games.length);

  const best = games.filter((g) => g.reviews >= MIN_REVIEWS_BEST).sort((a, b) => b.pctPos - a.pctPos || b.reviews - a.reviews).slice(0, BEST_COUNT);
  const track = $("[data-best]");
  track.replaceChildren(...best.map((g) => createGameCard(g, say, openQuickView)));
  initSlider($("[data-slider]"), track);

  const fresh = [...games].sort((a, b) => b.date.localeCompare(a.date)).slice(0, NEW_COUNT);
  $("[data-new]").replaceChildren(...fresh.map((g) => createGameCard(g, say, openQuickView)));
}

init();
