export default function header() {
  const headerHTML = /*html*/ `
    <button id="sidebarToggle"
    class="sidebar__toggle"
    type="button"
    aria-label="Ouvrir/fermer la sidebar"
    aria-controls="site-sidebar"
    aria-expanded="true">
        ☰
    </button>
    `;

  document.body.insertAdjacentHTML("afterbegin", headerHTML);
}
