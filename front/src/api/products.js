import { API_BASE, withQuery, parseJsonOrThrow } from "./base.js";

const ROUTES = {
  index: `${API_BASE}/?route=products.index`,
  create: `${API_BASE}/?route=products.create`,
  edit: (id) => `${API_BASE}/?route=products.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=products.delete&id=${encodeURIComponent(id)}&delete=1`,
};

export async function fetchProducts(filters = {}) {
  const url = withQuery(ROUTES.index, filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonOrThrow(res, "Erreur GET produits");
}

export async function createProduct({
  sku,
  title,
  price_cents,
  stock = 0,
  category_ids = [],
}) {
  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      sku: String(sku).trim(),
      title: String(title).trim(),
      price_cents: Number(price_cents),
      stock: Number(stock),
      category_ids,
    }),
  });
  return parseJsonOrThrow(res, "Erreur création produit");
}

export async function editProduct(
  id,
  { sku, title, price_cents, stock = 0, category_ids = null }
) {
  const payload = {
    sku: String(sku).trim(),
    title: String(title).trim(),
    price_cents: Number(price_cents),
    stock: Number(stock),
  };
  if (Array.isArray(category_ids)) payload.category_ids = category_ids;

  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Erreur édition produit");
}

export async function deleteProduct(id) {
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res, "Erreur suppression produit");
}
