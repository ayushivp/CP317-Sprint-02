// Unit tests for CHK-1 (checkout + tax). Run with:  node cart/checkout.test.js

const assert = require("assert");
const { calculateOrderTotals, validateCheckout, createOrder } = require("./checkout.js");

const NOW = new Date(2026, 10, 13); // 13 Nov 2026

const goodForm = {
  fullName: "Leane David",
  email: "leane@example.com",
  address: "75 University Ave W",
  city: "Waterloo",
  province: "ON",
  postalCode: "N2L 3C5",
  cardName: "Leane David",
  cardNumber: "4242 4242 4242 4242",
  expiry: "08/28",
  cvv: "123",
};

const machine = { id: "espresso-machine-1", name: "Espresso Machine No. 01", priceCents: 24999, quantity: 1 };
const machine2 = { id: "espresso-machine-2", name: "Espresso Machine No. 02", priceCents: 15999, quantity: 2 };

const tests = {
  "HST is 13% of the subtotal": () => {
    const t = calculateOrderTotals(24999);
    assert.strictEqual(t.taxCents, 3250); // 3249.87 rounds to 3250
    assert.strictEqual(t.totalCents, 24999 + 3250);
  },

  "total = subtotal + HST + shipping": () => {
    const t = calculateOrderTotals(10000);
    assert.strictEqual(t.taxCents, 1300);
    assert.strictEqual(t.shippingCents, 0);
    assert.strictEqual(t.totalCents, 11300);
  },

  "empty subtotal gives $0.00 everywhere": () => {
    assert.deepStrictEqual(calculateOrderTotals(0),
      { subtotalCents: 0, taxCents: 0, shippingCents: 0, totalCents: 0 });
  },

  "invalid subtotal is rejected": () => {
    assert.throws(() => calculateOrderTotals(-5));
    assert.throws(() => calculateOrderTotals(10.5));
  },

  "a complete form has no errors": () => {
    assert.deepStrictEqual(validateCheckout(goodForm, NOW), {});
  },

  "an empty form flags every field": () => {
    const errors = validateCheckout({}, NOW);
    ["fullName", "email", "address", "city", "province", "postalCode",
     "cardName", "cardNumber", "expiry", "cvv"].forEach((f) =>
      assert.ok(errors[f], `expected an error for ${f}`));
  },

  "bad email, postal code and card number are flagged": () => {
    const errors = validateCheckout(
      { ...goodForm, email: "leane@", postalCode: "12345", cardNumber: "4242" }, NOW);
    assert.ok(errors.email);
    assert.ok(errors.postalCode);
    assert.ok(errors.cardNumber);
  },

  "expired card is rejected, current month is accepted": () => {
    assert.ok(validateCheckout({ ...goodForm, expiry: "10/26" }, NOW).expiry);
    assert.strictEqual(validateCheckout({ ...goodForm, expiry: "11/26" }, NOW).expiry, undefined);
    assert.ok(validateCheckout({ ...goodForm, expiry: "13/27" }, NOW).expiry);
  },

  "order totals include HST for every item and quantity": () => {
    const order = createOrder([machine, machine2], goodForm, NOW);
    const subtotal = 24999 + 15999 * 2; // 56997
    assert.strictEqual(order.totals.subtotalCents, subtotal);
    assert.strictEqual(order.totals.taxCents, Math.round(subtotal * 0.13));
    assert.strictEqual(order.totals.totalCents, subtotal + Math.round(subtotal * 0.13));
    assert.ok(order.orderNumber.startsWith("EE-"));
  },

  "order keeps only the last 4 card digits": () => {
    const order = createOrder([machine], goodForm, NOW);
    assert.strictEqual(order.cardLast4, "4242");
    const saved = JSON.stringify(order);
    assert.ok(!saved.includes("4242 4242"));
    assert.ok(!saved.includes("123\""), "CVV must not be stored");
  },

  "cannot place an order with an empty cart": () => {
    assert.throws(() => createOrder([], goodForm, NOW));
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
