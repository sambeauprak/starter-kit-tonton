import {
  fetchOrders,
  fetchOrder,
  createOrder,
  editOrderStatus,
  replaceOrderItems,
  deleteOrder,
} from "../api/orders.js";
import { fetchCustomers } from "../api/customers.js";
import { fetchProducts } from "../api/products.js";
import { toast } from "../components/toast.js";
import { ensureListContainer } from "../components/list.js";
import { openModal } from "../components/modal.js";
import { createDataGrid } from "../components/datagrid.js";
import { Columns } from "../components/columns.js";

const cache = new Map();
let eventsBound = false;
let gridApi = null;

export default async function ordersPage() {
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
    ...Columns.orders(),
    {
      key: "actions",
      header: "",
      sortable: false,
      width: "260px",
      cell: (row) => {
        const id = row.id;
        const w = document.createElement("div");
        w.style.display = "flex";
        w.style.gap = ".25rem";
        const stat = Object.assign(document.createElement("button"), {
          type: "button",
          className: "btn btn-ghost",
          textContent: "Statut",
        });
        stat.dataset.action = "status";
        stat.dataset.id = String(id);
        const items = Object.assign(document.createElement("button"), {
          type: "button",
          className: "btn btn-ghost",
          textContent: "Lignes",
        });
        items.dataset.action = "items";
        items.dataset.id = String(id);
        const del = Object.assign(document.createElement("button"), {
          type: "button",
          className: "btn btn-ghost",
          textContent: "Supprimer",
        });
        del.dataset.action = "delete";
        del.dataset.id = String(id);
        w.append(stat, items, del);
        return w;
      },
    },
  ];

  gridApi = createDataGrid(host, {
    columns: cols,
    rows: [...cache.values()],
    storageKey: "columns:orders",
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

        if (btn.dataset.action === "status") {
          const row = cache.get(String(id));
          if (row) await openStatusModal(row);
        } else if (btn.dataset.action === "items") {
          await openItemsModal(id);
        } else if (btn.dataset.action === "delete") {
          const ok = await confirmDelete(cache.get(String(id)));
          if (ok) {
            try {
              await deleteOrder(id);
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
  const { data } = await fetchOrders({
    page: 1,
    per_page: 1000,
    sort: "created_at",
    dir: "desc",
  });
  cache.clear();
  for (const r of data) if (r && r.id != null) cache.set(String(r.id), r);
  if (gridApi) gridApi.update([...cache.values()]);
}

async function openAddModal() {
  const form = await buildOrderForm();
  await openModal({
    title: "Créer une commande",
    content: form.el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const payload = form.read();
      if (!payload.customer_id || !payload.items.length) return false;
      try {
        await createOrder(payload);
        await refresh();
        toast("✅ Ajoutée");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur ajout"), true);
        throw e;
      }
    },
  });
}

async function openStatusModal(row) {
  const el = document.createElement("form");
  el.className = "grid gap-2 form";
  el.innerHTML = `
    <label class="label" for="m-status">Statut</label>
    <select id="m-status" class="input">
      ${["pending", "paid", "refunded", "cancelled"]
        .map(
          (s) =>
            `<option ${
              row.status === s ? "selected" : ""
            } value="${s}">${s}</option>`
        )
        .join("")}
    </select>`;
  el.addEventListener("submit", (e) => e.preventDefault());
  await openModal({
    title: `Statut commande #${row.id}`,
    content: el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const status = el.querySelector("#m-status").value;
      try {
        await editOrderStatus(row.id, status);
        await refresh();
        toast("✅ Statut mis à jour");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur statut"), true);
        throw e;
      }
    },
  });
}

async function openItemsModal(orderId) {
  const order = await fetchOrder(orderId);
  const form = await buildItemsForm(order.items || []);
  await openModal({
    title: `Lignes commande #${orderId}`,
    content: form.el,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const items = form.read();
      if (!items.length) return false;
      try {
        await replaceOrderItems(orderId, items);
        await refresh();
        toast("✅ Lignes mises à jour");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur lignes"), true);
        throw e;
      }
    },
  });
}

function confirmDelete(row) {
  const box = document.createElement("div");
  box.innerHTML = `<p>Supprimer cette commande&nbsp;?</p><p class="muted">#${
    row?.id ?? ""
  } — ${row?.name ?? ""}</p>`;
  return openModal({
    title: "Confirmation",
    content: box,
    confirmText: "Oui, supprimer",
    cancelText: "Annuler",
  });
}

/* --- Forms --- */

async function buildOrderForm() {
  const customers = (await fetchCustomers({ page: 1, per_page: 1000 })).data;
  const products = (await fetchProducts({ page: 1, per_page: 1000 })).data;

  const el = document.createElement("form");
  el.className = "grid gap-2 form";
  el.innerHTML = `
    <label class="label" for="m-cust">Client</label>
    <select id="m-cust" class="input" required></select>

    <label class="label" for="m-status">Statut</label>
    <select id="m-status" class="input">
      <option value="pending">pending</option>
      <option value="paid">paid</option>
      <option value="refunded">refunded</option>
      <option value="cancelled">cancelled</option>
    </select>

    <div id="itemsWrap" class="card">
      <div class="flex items-center justify-between mb-2">
        <span class="label">Lignes</span>
        <button type="button" class="btn btn-ghost" id="addItemBtn">+ Ajouter</button>
      </div>
      <div id="items"></div>
    </div>
    <div class="text-sm" id="formMsg"></div>`;
  el.addEventListener("submit", (e) => e.preventDefault());

  // customers options
  const selCust = el.querySelector("#m-cust");
  for (const c of customers) {
    const o = document.createElement("option");
    o.value = String(c.id);
    o.textContent = `${c.name} <${c.email}>`;
    selCust.append(o);
  }

  // items builder
  const list = el.querySelector("#items");
  const addBtn = el.querySelector("#addItemBtn");
  addBtn.addEventListener("click", () => addItemRow());

  function addItemRow(init = {}) {
    const row = document.createElement("div");
    row.className = "grid gap-2";
    row.style.gridTemplateColumns = "2fr 1fr 1fr auto";
    row.style.alignItems = "center";
    const sel = document.createElement("select");
    sel.className = "input";
    for (const p of products) {
      const o = document.createElement("option");
      o.value = String(p.id);
      o.textContent = `${p.title} (${p.sku})`;
      if (p.id === init.product_id) o.selected = true;
      sel.append(o);
    }
    const qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.required = true;
    qty.className = "input";
    qty.value = String(init.quantity ?? 1);
    const price = document.createElement("input");
    price.type = "number";
    price.min = "0";
    price.required = true;
    price.className = "input";
    price.value = String(
      init.unit_price_cents ??
        (() => {
          const p = products.find((pp) => pp.id === Number(sel.value));
          return p?.price_cents ?? 0;
        })()
    );
    sel.addEventListener("change", () => {
      const p = products.find((pp) => pp.id === Number(sel.value));
      if (p) price.value = String(p.price_cents);
    });
    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn btn-ghost";
    rm.textContent = "Retirer";
    rm.addEventListener("click", () => row.remove());
    row.append(sel, qty, price, rm);
    list.append(row);
  }

  // une ligne par défaut
  addItemRow();

  const read = () => {
    const items = [];
    for (const row of list.children) {
      const [sel, qty, price] = row.querySelectorAll("select,input");
      const product_id = Number(sel.value);
      const quantity = Number(qty.value);
      const unit_price_cents = Number(price.value);
      if (
        Number.isFinite(product_id) &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        Number.isFinite(unit_price_cents) &&
        unit_price_cents >= 0
      ) {
        items.push({ product_id, quantity, unit_price_cents });
      }
    }
    return {
      customer_id: Number(el.querySelector("#m-cust").value),
      status: el.querySelector("#m-status").value,
      items,
    };
  };
  return { el, read };
}

async function buildItemsForm(existing = []) {
  const products = (await fetchProducts({ page: 1, per_page: 1000 })).data;
  const el = document.createElement("form");
  el.className = "grid gap-2 form";
  el.innerHTML = `
    <div id="itemsWrap" class="card">
      <div class="flex items-center justify-between mb-2">
        <span class="label">Lignes</span>
        <button type="button" class="btn btn-ghost" id="addItemBtn">+ Ajouter</button>
      </div>
      <div id="items"></div>
    </div>`;
  el.addEventListener("submit", (e) => e.preventDefault());

  const list = el.querySelector("#items");
  const addBtn = el.querySelector("#addItemBtn");
  addBtn.addEventListener("click", () => addItemRow());

  function addItemRow(init = {}) {
    const row = document.createElement("div");
    row.className = "grid gap-2";
    row.style.gridTemplateColumns = "2fr 1fr 1fr auto";
    row.style.alignItems = "center";
    const sel = document.createElement("select");
    sel.className = "input";
    for (const p of products) {
      const o = document.createElement("option");
      o.value = String(p.id);
      o.textContent = `${p.title} (${p.sku})`;
      if (p.id === init.product_id) o.selected = true;
      sel.append(o);
    }
    const qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.required = true;
    qty.className = "input";
    qty.value = String(init.quantity ?? 1);
    const price = document.createElement("input");
    price.type = "number";
    price.min = "0";
    price.required = true;
    price.className = "input";
    price.value = String(
      init.unit_price_cents ??
        (() => {
          const p = products.find((pp) => pp.id === Number(sel.value));
          return p?.price_cents ?? 0;
        })()
    );
    sel.addEventListener("change", () => {
      const p = products.find((pp) => pp.id === Number(sel.value));
      if (p) price.value = String(p.price_cents);
    });
    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn btn-ghost";
    rm.textContent = "Retirer";
    rm.addEventListener("click", () => row.remove());
    row.append(sel, qty, price, rm);
    list.append(row);
  }

  existing.forEach(addItemRow);
  if (!existing.length) addItemRow();

  const read = () => {
    const items = [];
    for (const row of list.children) {
      const [sel, qty, price] = row.querySelectorAll("select,input");
      const product_id = Number(sel.value);
      const quantity = Number(qty.value);
      const unit_price_cents = Number(price.value);
      if (
        Number.isFinite(product_id) &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        Number.isFinite(unit_price_cents) &&
        unit_price_cents >= 0
      ) {
        items.push({ product_id, quantity, unit_price_cents });
      }
    }
    return items;
  };
  return { el, read };
}
