export default async function notFound(root) {
  const s = document.createElement("section");
  s.className = "card";
  s.innerHTML = `<h1>404</h1><p>Page non trouvée.</p>`;
  root.append(s);
}
