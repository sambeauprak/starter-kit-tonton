import { API_BASE, withQuery, parseJsonOrThrow } from "./base.js";

const ROUTES = {
  index: `${API_BASE}/?route=orders.index`,
  show: (id) => `${API_BASE}/?route=orders.show&id=${encodeURIComponent(id)}`,
  create: `${API_BASE}/?route=orders.create`,
  editStatus: (id) =>
    `${API_BASE}/?route=orders.editStatus&id=${encodeURIComponent(id)}`,
  replaceItems: (id) =>
    `${API_BASE}/?route=orders.replaceItems&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=orders.delete&id=${encodeURIComponent(id)}&delete=1`,
  export: `${API_BASE}/?route=orders.export`,
};

export async function fetchOrders(filters = {}) {
  const url = withQuery(ROUTES.index, filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonOrThrow(res, "Erreur GET commandes");
}

export async function fetchOrder(id) {
  const res = await fetch(ROUTES.show(id), {
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res, "Erreur GET commande");
}

export async function createOrder({ customer_id, status = "pending", items }) {
  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: Number(customer_id), status, items }),
  });
  return parseJsonOrThrow(res, "Erreur création commande");
}

export async function editOrderStatus(id, status) {
  const res = await fetch(ROUTES.editStatus(id), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parseJsonOrThrow(res, "Erreur changement statut");
}

export async function replaceOrderItems(id, items) {
  const res = await fetch(ROUTES.replaceItems(id), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return parseJsonOrThrow(res, "Erreur MAJ lignes commande");
}

export async function deleteOrder(id) {
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res, "Erreur suppression commande");
}

// CSV (Blob). À toi de déclencher le téléchargement côté UI.
export async function exportOrdersCsv(filters = {}) {
  const url = withQuery(ROUTES.export, filters);
  const res = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!res.ok) throw new Error("Erreur export CSV");
  const blob = await res.blob();
  return blob; // type 'text/csv'
}
