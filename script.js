
const products = [
  {
    id: "espresso-machine-1",
    name: "Espresso Machine No. 01",
    category: "machines",
    categoryLabel: "ESPRESSO MACHINE",
    priceCents: 24999,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=85",
    tag: "THE FIRST EDIT"
  },
  {
    id: "espresso-machine-2",
    name: "Espresso Machine No. 02",
    category: "machines",
    categoryLabel: "ESPRESSO MACHINE",
    priceCents: 15999,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    tag: "THE SECOND EDIT"
  }
];

const STORAGE_KEY = "espresso-edit-cart";

function getCart() {
  const savedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return new window.Cart(savedItems);
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.getItems()));
}

function formatProductPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderProducts(filteredProducts = products) {
  const productGrid = document.getElementById("product-grid");
  const productCount = document.getElementById("product-count");
  const noResults = document.getElementById("no-results");

  if (!productGrid) return;

  productGrid.innerHTML = "";

  if (productCount) {
    productCount.textContent = `${filteredProducts.length} PRODUCTS`;
  }

  if (noResults) {
    noResults.style.display = filteredProducts.length === 0 ? "block" : "none";
  }

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        <span class="product-tag">${product.tag}</span>
      </div>

      <div class="product-information">
        <p class="product-category">${product.categoryLabel}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatProductPrice(product.priceCents)}</p>
        <button class="add-to-cart" type="button">
          ADD TO CART
        </button>
      </div>
    `;

    const addButton = card.querySelector(".add-to-cart");

    addButton.addEventListener("click", () => {
      addProductToCart(product, addButton);
    });

    productGrid.appendChild(card);
  });
}

function addProductToCart(product, button) {
  const cart = getCart();

  cart.addItem({
    id: product.id,
    name: product.name,
    priceCents: product.priceCents,
    image: product.image,
    categoryLabel: product.categoryLabel
  });

  saveCart(cart);
  updateHeaderCartCount();

  const originalText = button.textContent;
  button.textContent = "ADDED ✓";

  setTimeout(() => {
    button.textContent = originalText;
  }, 1200);
}

function updateHeaderCartCount() {
  const countElement = document.getElementById("header-cart-count");

  if (!countElement) return;

  const cart = getCart();
  countElement.textContent = cart.getItemCount();
}

function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-button");
  const searchInput = document.getElementById("product-search");

  let activeCategory = "all";

  function applyFilters() {
    const searchTerm = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

    const filteredProducts = products.filter(product => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.categoryLabel.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });

    renderProducts(filteredProducts);
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "all";

      filterButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.Cart) {
    console.error("Cart.js did not load. Check the script path in index.html.");
    return;
  }

  renderProducts();
  setupFilters();
  updateHeaderCartCount();
});
