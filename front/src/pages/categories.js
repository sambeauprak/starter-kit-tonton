import {
  fetchCategories,
  createCategory,
  editCategory,
  deleteCategory,
} from "../api/categories.js";
import { toast } from "../components/toast.js";
import { ensureListContainer } from "../components/list.js";
import { openModal } from "../components/modal.js";
import { createDataGrid } from "../components/datagrid.js";
import { Columns } from "../components/columns.js";

const cache = new Map();
let eventsBound = false;
let gridApi = null;

export default async function categoriesPage() {
  ensureListContainer();
  let host = document.getElementById("tableHost");
  const oldList = document.getElementById("list");
  if (!host) {
    host = document.createElement("div");
    host.id = "tableHost";
    oldList
      ? oldList.replaceWith(host)
      : document.getElementById("app")?.append(host);
  }

  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn && !document.getElementById("openAddModalBtn")) {
    const addBtn = document.createElement("button");
    addBtn.id = "openAddModalBtn";
    addBtn.type = "button";
    addBtn.className = "btn";
    addBtn.textContent = "Ajouter";
    refreshBtn.insertAdjacentElement("beforebegin", addBtn);
  }

  await refresh();

  const cols = [
    ...Columns.categories(),
    {
      key: "actions",
      header: "",
      sortable: false,
      width: "140px",
      cell: (row) => {
        const id = row.id;
        const w = document.createElement("div");
        w.style.display = "flex";
        w.style.gap = ".25rem";
        const edit = Object.assign(document.createElement("button"), {
          type: "button",
          className: "btn btn-ghost",
          textContent: "Éditer",
        });
        edit.dataset.action = "edit";
        edit.dataset.id = String(id);
        const del = Object.assign(document.createElement("button"), {
          type: "button",
          className: "btn btn-ghost",
          textContent: "Supprimer",
        });
        del.dataset.action = "delete";
        del.dataset.id = String(id);
        w.append(edit, del);
        return w;
      },
    },
  ];

  gridApi = createDataGrid(host, {
    columns: cols,
    rows: [...cache.values()],
    storageKey: "columns:categories",
  });

  if (!eventsBound) {
    eventsBound = true;
    document.addEventListener(
      "click",
      async (e) => {
        if (e.target.closest("#refreshBtn")) {
          await safeRefresh();
          return;
        }
        if (e.target.closest("#openAddModalBtn")) {
          await openAddModal();
          return;
        }
        const btn = e.target.closest("button[data-action]");
        if (!btn || !host.contains(btn)) return;
        const id = Number(btn.dataset.id);
        if (!Number.isFinite(id)) return;
        if (btn.dataset.action === "edit") {
          const row = cache.get(String(id));
          if (row) await openEditModal(row);
        } else if (btn.dataset.action === "delete") {
          const ok = await confirmDelete(cache.get(String(id)));
          if (ok) {
            try {
              await deleteCategory(id);
              await refresh();
              toast("🗑️ Supprimé");
            } catch (e) {
              toast("❌ " + (e?.message || "Erreur suppression"), true);
            }
          }
        }
      },
      { passive: true }
    );
  }
}

async function safeRefresh() {
  try {
    await refresh();
  } catch {
    toast("❌ Rafraîchissement impossible", true);
  }
}

async function refresh() {
  const { data } = await fetchCategories();
  cache.clear();
  for (const r of data) if (r && r.id != null) cache.set(String(r.id), r);
  if (gridApi) gridApi.update([...cache.values()]);
}

async function openAddModal() {
  const form = buildForm();
  await openModal({
    title: "Ajouter une catégorie",
    content: form.el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const p = form.read();
      if (!p.name) return false;
      try {
        await createCategory(p);
        await refresh();
        toast("✅ Ajouté");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur ajout"), true);
        throw e;
      }
    },
  });
}

async function openEditModal(row) {
  const form = buildForm(row);
  await openModal({
    title: "Modifier la catégorie",
    content: form.el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const p = form.read();
      if (!p.name) return false;
      try {
        await editCategory(row.id, p);
        await refresh();
        toast("✅ Modifié");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur édition"), true);
        throw e;
      }
    },
  });
}

function confirmDelete(row) {
  const box = document.createElement("div");
  box.innerHTML = `<p>Supprimer cette catégorie&nbsp;?</p><p class="muted"><strong>${esc(
    row?.name || ""
  )}</strong></p>`;
  return openModal({
    title: "Confirmation",
    content: box,
    confirmText: "Oui, supprimer",
    cancelText: "Annuler",
  });
}

function buildForm(row = {}) {
  const el = document.createElement("form");
  el.className = "grid gap-2 form";
  el.innerHTML = `
    <label class="label" for="m-name">Nom</label>
    <input id="m-name" class="input" required value="${escAttr(
      row.name || ""
    )}">
    <div class="text-sm" id="formMsg"></div>`;
  el.addEventListener("submit", (e) => e.preventDefault());
  const read = () => ({ name: el.querySelector("#m-name").value.trim() });
  return { el, read };
}
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}
function escAttr(s) {
  return esc(s).replace(/"/g, "&quot;");
}
