//import { NAV_ITEMS } from "../config";
import NAV_ITEMS from "../config/index.js";

export default function sidebar() {
  const html = /*html*/ `
    <aside class="sidebar">
      <nav class="nav nav--vertical" id="sidebarNav">
      </nav>

      <button id="themeToggle" class="toggle" aria-label="Basculer le thème">
        <span class="toggle__label">Light</span>
        <span class="toggle__track"><span class="toggle__thumb"></span></span>
        <span class="toggle__label">Dark</span>
      </button>
    </aside>
  `;

  document.body.insertAdjacentHTML("afterbegin", html);
  NAV_ITEMS.forEach((item) => {
    document.getElementById("sidebarNav").insertAdjacentHTML(
      "beforeend",
      `
        <a class="nav__link" data-link href="${item.link}">${item.name}</a>
      `
    );
  });

  const themeToggle = document.getElementById("themeToggle");
  // Toggle light/dark + animation
  themeToggle.addEventListener("click", () => {
    const root = document.body;
    const current = root.getAttribute("data-theme") || "light";
    root.setAttribute("data-theme", current === "light" ? "dark" : "light");
  });

  // Toggle sidebar

  const btn = document.getElementById("sidebarToggle");

  function setExpanded(expanded) {
    btn.setAttribute("aria-expanded", String(expanded));
  }

  btn.addEventListener("click", () => {
    const closed = document.body.classList.toggle("sidebar-closed");
    setExpanded(!closed);
  });

  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "sidebar__overlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", () => {
    document.body.classList.add("sidebar-closed");
    setExpanded(false);
  });
}
