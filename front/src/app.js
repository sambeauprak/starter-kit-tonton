import header from "./components/header.js";
import { createRouter } from "./router.js";

import home from "./pages/home.js";
import notes from "./pages/notes.js";
import products from "./pages/products.js";
import categories from "./pages/categories.js";
import orders from "./pages/orders.js";
import customers from "./pages/customers.js";
import about from "./pages/about.js";
import notFound from "./pages/not-found.js";
import sidebar from "./components/sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  header();
  sidebar();

  const mount = document.getElementById("app");
  const router = createRouter({
    routes: {
      "/": home,
      "/notes": notes,
      "/products": products,
      "/categories": categories,
      "/orders": orders,
      "/customers": customers,
      "/about": about,
      "/404": notFound,
    },
    mount,
  });

  router.start(); // rend la page courante
});
