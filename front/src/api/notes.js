import { API_BASE, toForm, parseJsonOrThrow } from "./base.js";

const ROUTES = {
  index: `${API_BASE}/?route=notes.index`,
  create: `${API_BASE}/?route=notes.create`,
  edit: (id) => `${API_BASE}/?route=notes.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=notes.delete&id=${encodeURIComponent(id)}&delete=1`,
};

export async function fetchNotes() {
  const res = await fetch(ROUTES.index, {
    headers: { Accept: "application/json" },
  });
  const data = await parseJsonOrThrow(res, "Erreur GET");
  return Array.isArray(data) ? data : data.data || [];
}

export async function createNote(payload) {
  const body = toForm({
    title: (payload.title ?? "").trim(),
    content: (payload.content ?? "").trim(),
  });
  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });
  return parseJsonOrThrow(res, "Erreur POST");
}

export async function editNote(id, payload) {
  const body = toForm({
    title: (payload.title ?? "").trim(),
    content: (payload.content ?? "").trim(),
  });
  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });
  return parseJsonOrThrow(res, "Erreur EDIT");
}

export async function deleteNote(id) {
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res, "Erreur DELETE");
}
