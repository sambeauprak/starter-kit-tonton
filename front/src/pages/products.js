import {
  fetchProducts,
  createProduct,
  editProduct,
  deleteProduct,
} from "../api/products.js";
import { fetchCategories } from "../api/categories.js";
import { toast } from "../components/toast.js";
import { ensureListContainer } from "../components/list.js";
import { openModal } from "../components/modal.js";
import { createDataGrid } from "../components/datagrid.js";
import { Columns } from "../components/columns.js";

const cache = new Map();
let eventsBound = false;
let gridApi = null;

export default async function productsPage() {
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
    ...Columns.products(),
    {
      key: "actions",
      header: "",
      width: "160px",
      sortable: false,
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
    storageKey: "columns:products",
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
              await deleteProduct(id);
              await refresh();
              toast("🗑️ Supprimé");
            } catch (err) {
              toast("❌ " + (err?.message || "Erreur suppression"), true);
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
  const { data } = await fetchProducts({ page: 1, per_page: 1000 });
  cache.clear();
  for (const r of data) if (r && r.id != null) cache.set(String(r.id), r);
  if (gridApi) gridApi.update([...cache.values()]);
}

async function openAddModal() {
  const form = await buildForm();
  await openModal({
    title: "Ajouter un produit",
    content: form.el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const p = form.read();
      if (!p.sku || !p.title || !(p.price_cents >= 0)) return false;
      try {
        await createProduct(p);
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
  const form = await buildForm(row);
  await openModal({
    title: "Modifier le produit",
    content: form.el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const p = form.read();
      if (!p.sku || !p.title || !(p.price_cents >= 0)) return false;
      try {
        await editProduct(row.id, p);
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
  box.innerHTML = `<p>Supprimer ce produit&nbsp;?</p><p class="muted"><strong>${esc(
    row?.title || ""
  )}</strong></p>`;
  return openModal({
    title: "Confirmation",
    content: box,
    confirmText: "Oui, supprimer",
    cancelText: "Annuler",
  });
}

async function buildForm(row = {}) {
  const categories =
    (await fetchCategories()).data || (await fetchCategories()).data; // garde simple
  const el = document.createElement("form");
  el.className = "grid gap-2 form";
  el.innerHTML = `
    <label class="label" for="m-sku">SKU</label>
    <input id="m-sku" class="input" required value="${escAttr(row.sku || "")}">
    <label class="label" for="m-title">Titre</label>
    <input id="m-title" class="input" required value="${escAttr(
      row.title || ""
    )}">
    <label class="label" for="m-price">Prix (cents)</label>
    <input id="m-price" class="input" type="number" min="0" required value="${
      Number.isFinite(row.price_cents) ? row.price_cents : 0
    }">
    <label class="label" for="m-stock">Stock</label>
    <input id="m-stock" class="input" type="number" min="0" required value="${
      Number.isFinite(row.stock) ? row.stock : 0
    }">
    <label class="label" for="m-cats">Catégories</label>
    <select id="m-cats" class="input" multiple size="5"></select>
    <div class="text-sm" id="formMsg"></div>`;
  el.addEventListener("submit", (e) => e.preventDefault());
  const sel = el.querySelector("#m-cats");
  const selectedIds = new Set(
    row.category_ids || row.categories?.map((c) => c.id) || []
  );
  for (const c of categories?.data || categories || []) {
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = c.name;
    if (selectedIds.has(c.id)) opt.selected = true;
    sel.append(opt);
  }
  const read = () => ({
    sku: el.querySelector("#m-sku").value.trim(),
    title: el.querySelector("#m-title").value.trim(),
    price_cents: Number(el.querySelector("#m-price").value),
    stock: Number(el.querySelector("#m-stock").value),
    category_ids: [...el.querySelector("#m-cats").selectedOptions].map((o) =>
      Number(o.value)
    ),
  });
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
