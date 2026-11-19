// Модальные окна на <dialog>: Esc и фокус внутри окна обеспечивает браузер,
// клик по фону закрывает окно, после закрытия фокус возвращается на кнопку, открывшую его.
let dialog = null;
let lastTrigger = null;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.className = "modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.innerHTML = `
    <div class="modal__box">
      <div class="modal__head">
        <h2 class="modal__title" id="modal-title"></h2>
        <button class="modal__close" type="button" aria-label="Закрыть окно">×</button>
      </div>
      <div class="modal__body"></div>
    </div>`;
  dialog.setAttribute("aria-labelledby", "modal-title");
  dialog.querySelector(".modal__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // клик на фон
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  });
  document.body.append(dialog);
  return dialog;
}

/** title — заголовок окна; fill(body) наполняет содержимое; trigger — кнопка, на которую вернётся фокус. */
export function openModal({ title, fill, trigger = document.activeElement, wide = false }) {
  const d = ensureDialog();
  lastTrigger = trigger;
  d.querySelector(".modal__title").textContent = title;
  const body = d.querySelector(".modal__body");
  body.replaceChildren();
  fill(body);
  d.classList.toggle("modal--wide", wide);
  document.body.classList.add("modal-open");
  d.showModal();
  d.querySelector(".modal__close").focus();
}
