import { API_BASE, withQuery, toForm, parseJsonOrThrow } from "./base.js";

const ROUTES = {
  index: `${API_BASE}/?route=categories.index`,
  create: `${API_BASE}/?route=categories.create`,
  edit: (id) =>
    `${API_BASE}/?route=categories.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=categories.delete&id=${encodeURIComponent(
      id
    )}&delete=1`,
};

export async function fetchCategories(filters = {}) {
  const url = withQuery(ROUTES.index, filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonOrThrow(res, "Erreur GET catégories");
}

export async function createCategory({ name }) {
  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: toForm({ name: String(name).trim() }),
  });
  return parseJsonOrThrow(res, "Erreur création catégorie");
}

export async function editCategory(id, { name }) {
  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: toForm({ name: String(name).trim() }),
  });
  return parseJsonOrThrow(res, "Erreur édition catégorie");
}

export async function deleteCategory(id) {
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res, "Erreur suppression catégorie");
}
