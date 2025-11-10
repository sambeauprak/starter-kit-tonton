import { fetchStats, fetchRevenue } from "../api/stats.js";
import { ensureListContainer } from "../components/list.js";
import { toast } from "../components/toast.js";

export default async function statsPage() {
  ensureListContainer();

  const hostId = "statsHost";
  let host = document.getElementById(hostId);
  const oldList = document.getElementById("list");
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    oldList
      ? oldList.replaceWith(host)
      : document.getElementById("app")?.append(host);
  }

  try {
    const [stats, rev] = await Promise.all([
      fetchStats(), // {revenue_cents, orders_count, aov_cents, orders_by_status, top_products[]}
      fetchRevenue(), // {labels, values}
    ]);

    host.innerHTML = `
      <div class="grid gap-6">
        <section class="grid gap-3" style="grid-template-columns: repeat(3,minmax(0,1fr));">
          ${kpiCard("Chiffre d'affaires", centsToEUR(stats.revenue_cents))}
          ${kpiCard("Commandes", String(stats.orders_count))}
          ${kpiCard("Panier moyen", centsToEUR(stats.aov_cents))}
        </section>

        <section class="card">
          <h3 class="text-lg fw-700 mb-2">Répartition statuts</h3>
          <ul class="list">
            ${Object.entries(stats.orders_by_status || {})
              .map(
                ([k, v]) =>
                  `<li class="list__item"><strong>${k}</strong> <span class="muted">${v}</span></li>`
              )
              .join("")}
          </ul>
        </section>

        <section class="card">
          <h3 class="text-lg fw-700 mb-2">Top produits (qty)</h3>
          <ul class="list">
            ${(stats.top_products || [])
              .map(
                (x) =>
                  `<li class="list__item"><strong>${esc(
                    x.title
                  )}</strong> <span class="muted">x${x.qty}</span></li>`
              )
              .join("")}
          </ul>
        </section>

        <section class="card">
          <h3 class="text-lg fw-700 mb-2">CA par jour</h3>
          <div class="list__item">
            ${rev.labels
              .map(
                (d, i) =>
                  `<div class="flex justify-between"><span class="muted">${d}</span><span>${centsToEUR(
                    rev.values[i]
                  )}</span></div>`
              )
              .join("")}
          </div>
        </section>
      </div>
    `;
  } catch (e) {
    toast("❌ Chargement des stats impossible", true);
  }
}

function kpiCard(label, value) {
  return `<div class="card"><div class="label">${label}</div><div class="text-2xl fw-700">${value}</div></div>`;
}
function centsToEUR(c) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format((c || 0) / 100);
}
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}
