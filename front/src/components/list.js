export function ensureListContainer() {
  if (document.getElementById("list")) return;

  const root = document.getElementById("app") || document.body;

  const header = document.createElement("header");
  header.className = "row";
  header.style.marginBottom = "1rem";
  const h1 = document.createElement("h1");
  h1.textContent = "Mes notes";
  const spacer = document.createElement("span");
  spacer.style.flex = "1";
  const refreshBtn = document.createElement("button");
  refreshBtn.id = "refreshBtn";
  refreshBtn.type = "button";
  refreshBtn.className = "btn";
  refreshBtn.textContent = "Rafraîchir";
  header.append(h1, spacer, refreshBtn);

  const section = document.createElement("section");
  section.className = "card";
  const ul = document.createElement("ul");
  ul.id = "list";
  ul.className = "list";
  section.append(ul);

  root.append(header, section);
}

export function renderList(items = []) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = "Aucune note.";
    ul.appendChild(li);
    return;
  }
  for (const it of items) ul.appendChild(renderItem(it));
}

export function renderItem(note) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(note.id);

  const title = document.createElement("strong");
  title.textContent = note.title || "(Sans titre)";

  const content = document.createElement("p");
  content.textContent = note.content || "";

  const small = document.createElement("small");
  small.className = "muted";
  const dt = note.updated_at
    ? new Date(note.updated_at)
    : new Date(note.created_at);
  small.textContent =
    dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleString() : "";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = ".5rem";
  actions.style.marginTop = ".25rem";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-ghost";
  editBtn.textContent = "Éditer";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = String(note.id);

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-ghost";
  delBtn.textContent = "Supprimer";
  delBtn.dataset.action = "delete";
  delBtn.dataset.id = String(note.id);

  actions.append(editBtn, delBtn);
  li.append(title, content, small, actions);
  return li;
}
