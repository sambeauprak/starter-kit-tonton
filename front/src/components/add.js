// Rend le formulaire d’ajout si absent
export default function add() {
  if (document.getElementById("noteForm")) return;

  const root = document.getElementById("app") || document.body;

  const section = document.createElement("section");
  section.className = "card";
  section.style.marginBottom = "1rem";

  const form = document.createElement("form");
  form.id = "noteForm";
  form.className = "grid gap-2";

  const labelT = document.createElement("label");
  labelT.className = "label";
  labelT.htmlFor = "title";
  labelT.textContent = "Titre";

  const inputT = document.createElement("input");
  inputT.id = "title";
  inputT.name = "title";
  inputT.className = "input";
  inputT.required = true;

  const labelC = document.createElement("label");
  labelC.className = "label";
  labelC.htmlFor = "content";
  labelC.textContent = "Contenu";

  const inputC = document.createElement("textarea");
  inputC.id = "content";
  inputC.name = "content";
  inputC.className = "input";
  inputC.rows = 4;
  inputC.required = true;

  const msg = document.createElement("div");
  msg.id = "formMsg";
  msg.className = "text-sm";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = ".5rem";

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.className = "btn";
  addBtn.textContent = "Ajouter";

  row.append(addBtn);
  form.append(labelT, inputT, labelC, inputC, msg, row);
  section.append(form);
  root.append(section);
}
