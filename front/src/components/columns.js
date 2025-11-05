// Sets de colonnes réutilisables
export const Columns = {
  notes({ withActions = true } = {}) {
    const base = [
      {
        key: "title",
        header: "Titre",
        sortable: true,
        accessor: (r) => (r.title || "").toLowerCase(),
      },
      {
        key: "content",
        header: "Contenu",
        sortable: false,
        accessor: (r) => r.content || "",
      },
      {
        key: "updated",
        header: "Modifié",
        sortable: true,
        accessor: (r) => new Date(r.updated_at || r.created_at),
        width: "180px",
      },
    ];
    if (withActions)
      base.push({
        key: "actions",
        header: "",
        sortable: false,
        width: "140px",
      });
    return base;
  },

  products() {
    return [
      { key: "title", header: "Produit", sortable: true },
      { key: "sku", header: "SKU", sortable: true, width: "120px" },
      { key: "price", header: "Prix", sortable: true, align: "right" },
      { key: "status", header: "Statut", sortable: true, width: "120px" },
      {
        key: "updated_at",
        header: "Modifié",
        sortable: true,
        accessor: (r) => new Date(r.updated_at),
        width: "180px",
      },
    ];
  },

  categories() {
    return [
      { key: "name", header: "Catégorie", sortable: true },
      { key: "slug", header: "Slug", sortable: true },
      {
        key: "products_count",
        header: "Produits",
        sortable: true,
        align: "right",
        width: "120px",
      },
      {
        key: "updated_at",
        header: "Modifié",
        sortable: true,
        accessor: (r) => new Date(r.updated_at),
        width: "180px",
      },
    ];
  },

  customers() {
    return [
      { key: "name", header: "Client", sortable: true },
      { key: "email", header: "Email", sortable: true },
      {
        key: "orders_count",
        header: "Commandes",
        sortable: true,
        align: "right",
        width: "130px",
      },
      {
        key: "created_at",
        header: "Inscription",
        sortable: true,
        accessor: (r) => new Date(r.created_at),
        width: "180px",
      },
    ];
  },

  orders() {
    return [
      { key: "number", header: "#", sortable: true, width: "90px" },
      {
        key: "customer",
        header: "Client",
        sortable: true,
        accessor: (r) => r.customer?.name || "",
      },
      {
        key: "total",
        header: "Total",
        sortable: true,
        align: "right",
        width: "120px",
      },
      { key: "status", header: "Statut", sortable: true, width: "120px" },
      {
        key: "created_at",
        header: "Créé",
        sortable: true,
        accessor: (r) => new Date(r.created_at),
        width: "180px",
      },
    ];
  },
};
