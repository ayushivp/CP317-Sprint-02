// Unit tests for CART-1. Run with:  node cart/cart.test.js

const assert = require("assert");
const { Cart, formatPrice } = require("./cart.js");

const beans = { id: "esp-1", name: "Classic Espresso Beans", priceCents: 1899 };
const cup = { id: "acc-1", name: "Ceramic Espresso Cup", priceCents: 1250 };

const tests = {
  "empty cart has total $0.00": () => {
    const cart = new Cart();
    assert.strictEqual(cart.isEmpty(), true);
    assert.strictEqual(cart.getTotal(), 0);
    assert.strictEqual(formatPrice(cart.getTotal()), "$0.00");
  },

  "adding a product raises the total by its price": () => {
    const cart = new Cart();
    cart.addItem(beans);
    assert.strictEqual(cart.getTotal(), 1899);
    cart.addItem(cup);
    assert.strictEqual(cart.getTotal(), 1899 + 1250);
  },

  "adding the same product twice raises its quantity": () => {
    const cart = new Cart();
    cart.addItem(beans);
    cart.addItem(beans);
    assert.strictEqual(cart.getItems().length, 1);
    assert.strictEqual(cart.getItems()[0].quantity, 2);
    assert.strictEqual(cart.getTotal(), 3798);
  },

  "removing a product lowers the total": () => {
    const cart = new Cart();
    cart.addItem(beans);
    cart.addItem(cup);
    cart.removeItem("esp-1");
    assert.strictEqual(cart.getTotal(), 1250);
    assert.strictEqual(cart.getItems().length, 1);
  },

  "changing quantity recalculates line and cart totals": () => {
    const cart = new Cart();
    cart.addItem(beans);
    cart.addItem(cup);
    cart.updateQuantity("acc-1", 3);
    assert.strictEqual(cart.getLineTotal("acc-1"), 3750);
    assert.strictEqual(cart.getTotal(), 1899 + 3750);
    assert.strictEqual(cart.getItemCount(), 4);
  },

  "setting quantity to 0 removes the item": () => {
    const cart = new Cart();
    cart.addItem(beans);
    cart.updateQuantity("esp-1", 0);
    assert.strictEqual(cart.isEmpty(), true);
  },

  "removing every item gives an empty cart": () => {
    const cart = new Cart();
    cart.addItem(beans);
    cart.removeItem("esp-1");
    assert.strictEqual(cart.isEmpty(), true);
    assert.strictEqual(cart.getTotal(), 0);
  },

  "invalid quantity is rejected": () => {
    const cart = new Cart();
    assert.throws(() => cart.addItem(beans, 0));
    assert.throws(() => cart.addItem(beans, 1.5));
  },

  "prices format as dollars": () => {
    assert.strictEqual(formatPrice(1899), "$18.99");
    assert.strictEqual(formatPrice(5), "$0.05");
  },
};

let passed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try {
    fn();
    console.log("PASS  " + name);
    passed++;
  } catch (e) {
    console.log("FAIL  " + name + "\n      " + e.message);
  }
}
console.log(`\n${passed}/${Object.keys(tests).length} tests passed`);
process.exitCode = passed === Object.keys(tests).length ? 0 : 1;
