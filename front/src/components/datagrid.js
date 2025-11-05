// DataGrid minimal, modulable, sans dépendances
export function createDataGrid(
  mount,
  {
    columns = [], // [{key, header, sortable, accessor?, cell?, align?, width?}]
    rows = [],
    rowId = (r) => r.id,
    storageKey = null, // ex: "columns:notes" pour mémoriser la visibilité
  } = {}
) {
  if (!mount) throw new Error("mount requis");

  // Etat
  const state = {
    rows: Array.isArray(rows) ? rows.slice() : [],
    sortKey: null,
    sortDir: "asc",
    visible: new Set(
      loadVisible(
        storageKey,
        columns.map((c) => c.key)
      )
    ),
  };

  // DOM
  mount.innerHTML = `
    <div class="dg">
      <div class="dg__toolbar">
        <div class="dg__info"></div>
        <div class="dg__actions">
          <button type="button" class="btn btn-ghost dg__colsBtn">Colonnes</button>
          <div class="dg__colsMenu card" hidden></div>
        </div>
      </div>
      <div class="dg__tableWrap">
        <table class="dg__table"><thead></thead><tbody></tbody></table>
      </div>
    </div>
  `;
  const root = mount.querySelector(".dg");
  const info = root.querySelector(".dg__info");
  const thead = root.querySelector("thead");
  const tbody = root.querySelector("tbody");
  const colsBtn = root.querySelector(".dg__colsBtn");
  const colsMenu = root.querySelector(".dg__colsMenu");

  // Build UI
  renderInfo();
  buildColsMenu();
  renderHead();
  renderBody();

  // Events
  thead.addEventListener("click", (e) => {
    const th = e.target.closest("th[data-key]");
    if (!th) return;
    const key = th.dataset.key;
    const col = columns.find((c) => c.key === key);
    if (!col || col.sortable === false) return;
    if (state.sortKey === key)
      state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
    else {
      state.sortKey = key;
      state.sortDir = "asc";
    }
    renderHead(); // maj aria-sort
    renderBody();
  });

  colsBtn.addEventListener("click", () => {
    colsMenu.hidden = !colsMenu.hidden; // toggle simple et fiable
  });
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) colsMenu.hidden = true;
  });

  function buildColsMenu() {
    colsMenu.innerHTML = "";
    columns.forEach((col) => {
      const id = `dg-col-${col.key}`;
      const row = document.createElement("label");
      row.className = "row gap-2 items-center";
      row.style.padding = ".25rem .5rem";
      row.innerHTML = `
        <input id="${id}" type="checkbox" ${
        state.visible.has(col.key) ? "checked" : ""
      } />
        <span>${col.header || col.key}</span>
      `;
      row.querySelector("input").addEventListener("change", (ev) => {
        if (ev.target.checked) state.visible.add(col.key);
        else {
          if (state.visible.size <= 1) {
            ev.target.checked = true;
            return;
          } // au moins 1 col
          state.visible.delete(col.key);
        }
        saveVisible(storageKey, [...state.visible]);
        renderHead();
        renderBody();
      });
      colsMenu.append(row);
    });
  }

  function renderInfo() {
    info.textContent = `${state.rows.length} élément${
      state.rows.length > 1 ? "s" : ""
    }`;
  }

  function visibleCols() {
    return columns.filter((c) => state.visible.has(c.key));
  }

  function renderHead() {
    const cols = visibleCols();
    const tr = document.createElement("tr");
    cols.forEach((col) => {
      const th = document.createElement("th");
      th.dataset.key = col.key;
      th.textContent = col.header || col.key;
      if (col.sortable !== false) th.classList.add("dg__th--sortable");
      if (col.align) th.style.textAlign = col.align;
      if (col.width) th.style.width = col.width;
      th.setAttribute(
        "aria-sort",
        col.key === state.sortKey ? state.sortDir : "none"
      );
      tr.append(th);
    });
    thead.innerHTML = "";
    thead.append(tr);
  }

  function renderBody() {
    const cols = visibleCols();
    const sorted = sortRows(state.rows, state.sortKey, state.sortDir, columns);
    const frag = document.createDocumentFragment();

    sorted.forEach((row) => {
      const tr = document.createElement("tr");
      tr.dataset.id = String(rowId(row));
      cols.forEach((col) => {
        const td = document.createElement("td");
        if (col.align) td.style.textAlign = col.align;
        let val;
        if (typeof col.cell === "function") {
          const out = col.cell(row);
          if (out instanceof HTMLElement || out instanceof DocumentFragment) {
            td.append(out);
          } else {
            td.textContent = out == null ? "" : String(out);
          }
        } else if (typeof col.accessor === "function") {
          val = col.accessor(row);
          td.textContent = formatCell(val);
        } else {
          val = row[col.key];
          td.textContent = formatCell(val);
        }
        tr.append(td);
      });
      frag.append(tr);
    });

    tbody.innerHTML = "";
    tbody.append(frag);
    renderInfo();
  }

  function update(rows) {
    state.rows = Array.isArray(rows) ? rows.slice() : [];
    renderBody();
  }

  return { update, state };

  // helpers
  function sortRows(rows, key, dir, colsDef) {
    if (!key) return rows.slice();
    const col = colsDef.find((c) => c.key === key);
    const get = col?.accessor || ((r) => r[key]);
    const mul = dir === "desc" ? -1 : 1;
    return rows.slice().sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * mul;
      if (bv == null) return 1 * mul;
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * mul;
      const ad = av instanceof Date ? av.getTime() : av;
      const bd = bv instanceof Date ? bv.getTime() : bv;
      return (
        String(ad).localeCompare(String(bd), undefined, { numeric: true }) * mul
      );
    });
  }
  function formatCell(v) {
    if (v instanceof Date)
      return !Number.isNaN(v.getTime()) ? v.toLocaleString() : "";
    return v == null ? "" : String(v);
  }
  function loadVisible(key, all) {
    if (!key) return all;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(saved) && saved.length)
        return saved.filter((x) => all.includes(x));
    } catch {}
    return all;
  }
  function saveVisible(key, arr) {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  }
}
