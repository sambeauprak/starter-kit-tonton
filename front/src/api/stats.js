import { API_BASE, withQuery, parseJsonOrThrow } from "./base.js";

const ROUTES = {
  index: `${API_BASE}/?route=stats.index`,
  revenue: `${API_BASE}/?route=stats.revenue`,
};

export async function fetchStats(filters = {}) {
  const url = withQuery(ROUTES.index, filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonOrThrow(res, "Erreur GET stats");
}

export async function fetchRevenue(filters = {}) {
  const url = withQuery(ROUTES.revenue, filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonOrThrow(res, "Erreur GET revenue");
}
