export default async function home(root) {
  const s = document.createElement("section");
  s.className = "card";
  s.innerHTML = `<h1>Accueil</h1><p>Exemple de router simple.</p>`;
  root.append(s);
}
