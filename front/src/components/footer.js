export default function footer() {
  const footerHTML = /*html*/ `
    <footer class="container py-6 text-sm opacity-70">
      <p>
        Back: <code>php -S localhost:8000 -t public</code> (dans le dossier
        <code>back</code>).
      </p>
    </footer>
    `;

  document.body.insertAdjacentHTML("beforeend", footerHTML);
}
