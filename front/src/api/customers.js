import { API_BASE, withQuery, toForm, parseJsonOrThrow } from "./base.js";

const ROUTES = {
  index: `${API_BASE}/?route=customers.index`,
  create: `${API_BASE}/?route=customers.create`,
  edit: (id) =>
    `${API_BASE}/?route=customers.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=customers.delete&id=${encodeURIComponent(id)}&delete=1`,
};

export async function fetchCustomers(filters = {}) {
  const url = withQuery(ROUTES.index, filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonOrThrow(res, "Erreur GET clients");
}

export async function createCustomer({ email, name }) {
  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: toForm({ email: String(email).trim(), name: String(name).trim() }),
  });
  return parseJsonOrThrow(res, "Erreur création client");
}

export async function editCustomer(id, { email, name }) {
  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: toForm({ email: String(email).trim(), name: String(name).trim() }),
  });
  return parseJsonOrThrow(res, "Erreur édition client");
}

export async function deleteCustomer(id) {
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res, "Erreur suppression client");
}
