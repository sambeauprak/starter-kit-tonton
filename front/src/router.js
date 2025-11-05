export function createRouter({ routes, mount }) {
  if (!routes || !mount) throw new Error("routes et mount requis");

  const pathFromHash = () => {
    const h = location.hash.replace(/^#/, "");
    return h || "/"; // défaut: "/"
  };

  async function render() {
    const path = pathFromHash();
    const view = routes[path] || routes["/404"];
    mount.innerHTML = "";
    await view(mount);
    setActive(path);
  }

  function setActive(path) {
    const wanted = "#" + path;
    document.querySelectorAll("[data-link]").forEach((a) => {
      const on = a.getAttribute("href") === wanted;
      a.classList.toggle("is-active", on);
      a.setAttribute("aria-current", on ? "page" : "false");
    });
  }

  window.addEventListener("hashchange", render);
  return {
    start: render,
    go: (p) => (location.hash = p.startsWith("#") ? p : "#" + p),
  };
}
