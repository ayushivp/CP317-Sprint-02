
class Cart {
  constructor(items = []) {
    this.items = items.map(item => ({ ...item }));
  }

  addItem(product, quantity = 1) {
    if (!product || !product.id || !product.name) {
      throw new Error("Invalid product.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    if (!Number.isInteger(product.priceCents) || product.priceCents < 0) {
      throw new Error("Product price must be valid.");
    }

    const existingItem = this.items.find(
      item => item.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        image: product.image || "",
        categoryLabel: product.categoryLabel || "",
        quantity
      });
    }

    return this.getItems();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    return this.getItems();
  }

  updateQuantity(productId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Quantity must be a non-negative integer.");
    }

    if (quantity === 0) {
      return this.removeItem(productId);
    }

    const item = this.items.find(item => item.id === productId);

    if (item) {
      item.quantity = quantity;
    }

    return this.getItems();
  }

  getItems() {
    return this.items.map(item => ({ ...item }));
  }

  getLineTotal(productId) {
    const item = this.items.find(item => item.id === productId);
    return item ? item.priceCents * item.quantity : 0;
  }

  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0
    );
  }

  getItemCount() {
    return this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  isEmpty() {
    return this.items.length === 0;
  }

  clear() {
    this.items = [];
  }
}

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Make Cart available to the storefront browser.
if (typeof window !== "undefined") {
  window.Cart = Cart;
}

// Keep Node.js compatibility for David's tests.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Cart, formatPrice };
}
