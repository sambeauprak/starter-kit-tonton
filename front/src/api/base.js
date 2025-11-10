// URL du back
export const API_BASE = "http://localhost:8000";

// Ajoute des query params (ignore null/undefined/""), gère les tableaux.
export function withQuery(url, params = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    if (Array.isArray(v)) v.forEach((it) => usp.append(k + "[]", String(it)));
    else usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${url}&${qs}` : url;
}

// Encodage form-urlencoded
export function toForm(data = {}) {
  const f = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) v.forEach((it) => f.append(k + "[]", String(it)));
    else f.set(k, String(v));
  }
  return f;
}

// Réponse JSON avec extraction message d’erreur si dispo
export async function parseJsonOrThrow(res, fallback = "Erreur requête") {
  if (res.ok) return res.json();
  let msg = fallback;
  try {
    const e = await res.json();
    if (e?.message || e?.error) msg = e.message || e.error;
  } catch {}
  throw new Error(msg);
}
