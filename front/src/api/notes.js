// URL du back
export const API_BASE = "http://localhost:8000";

// Routes du contrôleur PHP
const ROUTES = {
  index: `${API_BASE}/?route=notes.index`,
  create: `${API_BASE}/?route=notes.create`,
  edit: (id) => `${API_BASE}/?route=notes.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=notes.delete&id=${encodeURIComponent(id)}&delete=1`,
};

// --- API ---
export async function fetchNotes() {
  const res = await fetch(ROUTES.index, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Erreur GET");
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function createNote(payload) {
  const body = new URLSearchParams({
    title: (payload.title ?? "").toString().trim(),
    content: (payload.content ?? "").toString().trim(),
  });

  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  if (!res.ok) {
    let msg = "Erreur POST";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function editNote(id, payload) {
  const body = new URLSearchParams({
    title: (payload.title ?? "").toString().trim(),
    content: (payload.content ?? "").toString().trim(),
  });

  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  if (!res.ok) {
    let msg = "Erreur EDIT";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    let msg = "Erreur DELETE";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
