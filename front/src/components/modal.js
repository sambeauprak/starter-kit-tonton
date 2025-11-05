export function openModal({
  title = "",
  content,
  confirmText = "Valider",
  cancelText = "Annuler",
  onConfirm,
} = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "modal__backdrop";
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modal__header"><h2 class="text-lg fw-700">${title}</h2></header>
        <div class="modal__body"></div>
        <footer class="modal__footer">
          <button type="button" class="btn btn-ghost" data-cancel>${cancelText}</button>
          <button type="button" class="btn" data-confirm>${confirmText}</button>
        </footer>
      </div>
    `;
    const body = wrap.querySelector(".modal__body");
    if (typeof content === "string") body.innerHTML = content;
    else if (content instanceof HTMLElement) body.append(content);

    function close(result = false) {
      wrap.remove();
      resolve(result);
    }
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close(false);
    });
    wrap
      .querySelector("[data-cancel]")
      .addEventListener("click", () => close(false));
    wrap.querySelector("[data-confirm]").addEventListener("click", async () => {
      if (typeof onConfirm === "function") {
        try {
          const r = await onConfirm();
          close(r ?? true);
        } catch {
          /* reste ouvert */
        }
      } else close(true);
    });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") {
        close(false);
        document.removeEventListener("keydown", esc);
      }
    });
    document.body.append(wrap);
  });
}
