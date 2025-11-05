export default async function about(root) {
  const s = document.createElement("section");
  s.className = "card";
  s.innerHTML = `<h1>À propos</h1><p>Router = 1 fichier, 1 écouteur.</p>`;
  root.append(s);
}
