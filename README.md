# Steam Games Market — аналитический сайт о рынке видеоигр

Курсовая работа: «Разработка веб-сайта рынка видеоигр Steam».
Статический многостраничный сайт (без серверной части) на HTML5, CSS3 и JavaScript.
Сайт показывает закономерности **выборки** из набора данных и не предсказывает успех игры
и не рекомендует цену. Покупки на сайте нет, цены только информационные.

> Статус: этап 0 (организационный старт). Разделы ниже заполняются по мере работы.

## Ссылки

- GitHub Pages: _будет добавлена после публикации_
- Набор данных (Kaggle): https://www.kaggle.com/datasets/artermiloff/steam-games-dataset
  — «Steam Games Dataset 2025», автор artermiloff. Версия и дата скачивания: _заполнить_
- Ноутбук подготовки данных (Google Colab): https://colab.research.google.com/github/KlimFrckAndrech/steam-games-market/blob/main/notebooks/steam_data_prep.ipynb

## Скриншоты

_Будут добавлены после вёрстки._

## Стек

HTML5, CSS3 (Grid, Flexbox, CSS-переменные, Nested БЭМ), JavaScript (ES6+, fetch, localStorage),
Chart.js, Swiper (слайдер), Python + pandas в Google Colab (подготовка данных).
Версии библиотек: _зафиксировать на этапе 1_.

## Структура репозитория

```
steam-games-market/
├── index.html  catalog.html  game.html  prices.html
├── platforms.html  wishlist.html  about.html
├── css/style.css        # только @import файлов блоков
├── blocks/              # Nested БЭМ: block/ → elements/, modifiers/
├── js/                  # модули: data, storage, catalog, charts, modal ...
├── data/                # games.json, prices.json, platforms.json
├── images/              # оформительские WebP-изображения
├── notebooks/           # копия ноутбука Colab
├── docs/                # рабочие материалы курсовой
├── README.md  LICENSE  .gitignore
```

## Подготовка данных

Набор собран в марте 2025, период игр 2009–2024. Правила (согласованы с руководителем):
не менее 50 отзывов (`num_reviews_total`); доля положительных пересчитывается по `positive` и `negative`,
в данных также индекс баланса отзывов от −100 до +100; игры с ценой 0 считаются бесплатными;
исключаются игры 18+ и с тегами Hentai, Nudity, Sexual Content, NSFW, Mature; выборка стратифицирована по году и цене.
Графики по годам и жанрам считаются по всем играм, прошедшим фильтры, а не по выборке.
Решение по полям цены и скидки — заполнить после проверки (вопрос Д2).

## Лицензии и источники изображений

- Код: MIT (см. LICENSE).
- Данные и обложки игр принадлежат правообладателям; обложки подгружаются с серверов Steam.
- Источники оформительских изображений: _таблица будет добавлена на этапе 3_.

## Локальный запуск

`fetch()` не работает при открытии файла двойным щелчком, нужен локальный сервер:

```
python -m http.server 8000
```

Затем открыть http://localhost:8000
