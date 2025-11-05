// src/pages/notes.js
import { fetchNotes, createNote, editNote, deleteNote } from "../api/notes.js";
import { toast } from "../components/toast.js";
import { ensureListContainer } from "../components/list.js";
import { openModal } from "../components/modal.js";
import { createDataGrid } from "../components/datagrid.js";
import { Columns } from "../components/columns.js";

// Cache + grid
const noteCache = new Map();
let eventsBound = false;
let gridApi = null;

export default async function notesPage() {
  // Construit l’entête (titre + bouton Rafraîchir) et la carte liste
  ensureListContainer();

  // Remplace <ul id="list"> par un host pour le DataGrid
  let host = document.getElementById("tableHost");
  const oldList = document.getElementById("list");
  if (!host) {
    host = document.createElement("div");
    host.id = "tableHost";
    if (oldList) oldList.replaceWith(host);
    else document.getElementById("app")?.append(host);
  }

  // Bouton Ajouter à côté de Rafraîchir
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn && !document.getElementById("openAddModalBtn")) {
    const addBtn = document.createElement("button");
    addBtn.id = "openAddModalBtn";
    addBtn.type = "button";
    addBtn.className = "btn";
    addBtn.textContent = "Ajouter";
    refreshBtn.insertAdjacentElement("beforebegin", addBtn);
  }

  // Charge les données
  await refresh();

  // Colonnes type Shopify + colonne Actions
  const cols = Columns.notes({ withActions: true }).map((c) => {
    if (c.key !== "actions") return c;
    return {
      ...c,
      cell: (row) => {
        const id = row.id;
        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.gap = ".25rem";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "btn btn-ghost";
        edit.textContent = "Éditer";
        edit.dataset.action = "edit";
        edit.dataset.id = String(id);
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn btn-ghost";
        del.textContent = "Supprimer";
        del.dataset.action = "delete";
        del.dataset.id = String(id);
        wrap.append(edit, del);
        return wrap;
      },
    };
  });

  // Instancie le DataGrid
  gridApi = createDataGrid(host, {
    columns: cols,
    rows: [...noteCache.values()],
    storageKey: "columns:notes",
  });

  // Délégation globale (refresh, add, actions ligne)
  if (!eventsBound) {
    eventsBound = true;
    document.addEventListener(
      "click",
      async (e) => {
        // Rafraîchir
        if (e.target.closest("#refreshBtn")) {
          try {
            await refresh();
          } catch {
            toast("❌ Rafraîchissement impossible", true);
          }
          return;
        }
        // Ajouter
        if (e.target.closest("#openAddModalBtn")) {
          await openAddModal();
          return;
        }
        // Actions de ligne (limité au host du grid)
        const btn = e.target.closest("button[data-action]");
        if (!btn || !host.contains(btn)) return;

        const id = Number(btn.dataset.id);
        if (!Number.isFinite(id)) return;

        if (btn.dataset.action === "edit") {
          const note = noteCache.get(String(id));
          if (note) await openEditModal(note);
        } else if (btn.dataset.action === "delete") {
          const ok = await openDeleteModal(id);
          if (ok) {
            try {
              await deleteNote(id);
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

// --- data ---

async function refresh() {
  const items = await fetchNotes();
  noteCache.clear();
  for (const n of items) if (n && n.id != null) noteCache.set(String(n.id), n);
  if (gridApi) gridApi.update([...noteCache.values()]);
}

// --- modals ---

async function openAddModal() {
  const form = buildForm();
  await openModal({
    title: "Ajouter une note",
    content: form,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const payload = readForm(form);
      if (!payload.title || !payload.content) return false; // ne ferme pas
      try {
        await createNote(payload);
        await refresh();
        toast("✅ Ajouté");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur ajout"), true);
        throw e;
      }
    },
  });
}

async function openEditModal(note) {
  const form = buildForm(note);
  await openModal({
    title: "Modifier la note",
    content: form,
    confirmText: "Enregistrer",
    onConfirm: async () => {
      const payload = readForm(form);
      if (!payload.title || !payload.content) return false;
      try {
        await editNote(note.id, payload);
        await refresh();
        toast("✅ Modifié");
      } catch (e) {
        toast("❌ " + (e?.message || "Erreur édition"), true);
        throw e;
      }
    },
  });
}

function openDeleteModal(noteId) {
  const note = noteCache.get(String(noteId));
  const box = document.createElement("div");
  box.innerHTML = `
    <p>Supprimer cette note&nbsp;?</p>
    <p class="muted">${
      note ? `<strong>${escapeHtml(note.title || "(Sans titre)")}</strong>` : ""
    }</p>
  `;
  return openModal({
    title: "Confirmation",
    content: box,
    confirmText: "Oui, supprimer",
    cancelText: "Annuler",
  });
}

// --- form utils ---

function buildForm(note = {}) {
  const wrap = document.createElement("form");
  wrap.className = "grid gap-2 form";
  wrap.innerHTML = `
    <label class="label" for="m-title">Titre</label>
    <input id="m-title" class="input" required value="${escapeAttr(
      note.title || ""
    )}">
    <label class="label" for="m-content">Contenu</label>
    <textarea id="m-content" class="input" rows="4" required>${escapeHtml(
      note.content || ""
    )}</textarea>
    <div class="text-sm" id="formMsg"></div>
  `;
  wrap.addEventListener("submit", (e) => e.preventDefault());
  return wrap;
}

function readForm(form) {
  const title = form.querySelector("#m-title")?.value.trim() || "";
  const content = form.querySelector("#m-content")?.value.trim() || "";
  return { title, content };
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
