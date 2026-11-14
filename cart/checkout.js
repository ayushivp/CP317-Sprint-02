/*
 * CHK-1: Checkout with tax
 * The Espresso Edit - CP317A Group 28, Sprint 2
 *
 * Checkout logic only (no page code), so it can be tested in Node.
 * All money is in cents, like cart.js.
 */

// Ontario HST. Applied to the cart subtotal.
const HST_RATE = 0.13;

// Shipping is free for the prototype.
const SHIPPING_CENTS = 0;

const PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
];

// Subtotal -> { subtotalCents, taxCents, shippingCents, totalCents }
function calculateOrderTotals(subtotalCents) {
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) {
    throw new Error("Subtotal must be a whole number of cents, 0 or more.");
  }
  const taxCents = Math.round(subtotalCents * HST_RATE);
  const shippingCents = subtotalCents === 0 ? 0 : SHIPPING_CENTS;
  return {
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents: subtotalCents + taxCents + shippingCents,
  };
}

function clean(value) {
  return String(value || "").trim();
}

function digitsOnly(value) {
  return clean(value).replace(/[\s-]/g, "");
}

// Checks the checkout form. Returns { fieldName: "error message" };
// an empty object means the form is valid.
// `now` is passed in so the expiry check can be tested.
function validateCheckout(form, now = new Date()) {
  const errors = {};

  if (clean(form.fullName).length < 2) {
    errors.fullName = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(form.email))) {
    errors.email = "Enter a valid email address.";
  }
  if (clean(form.address).length < 5) {
    errors.address = "Enter your street address.";
  }
  if (clean(form.city).length < 2) {
    errors.city = "Enter your city.";
  }
  if (!PROVINCES.includes(clean(form.province))) {
    errors.province = "Choose a province or territory.";
  }
  if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(clean(form.postalCode))) {
    errors.postalCode = "Enter a postal code like N2L 3C5.";
  }

  if (clean(form.cardName).length < 2) {
    errors.cardName = "Enter the name on the card.";
  }
  if (!/^\d{16}$/.test(digitsOnly(form.cardNumber))) {
    errors.cardNumber = "Card number must be 16 digits.";
  }

  const expiry = clean(form.expiry).match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!expiry || Number(expiry[1]) < 1 || Number(expiry[1]) > 12) {
    errors.expiry = "Enter the expiry as MM/YY.";
  } else {
    const month = Number(expiry[1]);
    const year = 2000 + Number(expiry[2]);
    const thisMonth = now.getFullYear() * 12 + now.getMonth(); // getMonth is 0-based
    if (year * 12 + (month - 1) < thisMonth) {
      errors.expiry = "This card has expired.";
    }
  }

  if (!/^\d{3}$/.test(clean(form.cvv))) {
    errors.cvv = "CVV must be 3 digits.";
  }

  return errors;
}

// Builds the order record shown on the confirmation screen.
// Only the last 4 card digits are kept; the full number and CVV are never stored.
function createOrder(items, form, now = new Date()) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  return {
    orderNumber: "EE-" + now.getTime().toString(36).toUpperCase(),
    placedAt: now.toISOString(),
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      priceCents: i.priceCents,
      quantity: i.quantity,
    })),
    totals: calculateOrderTotals(subtotalCents),
    shipTo: {
      fullName: clean(form.fullName),
      email: clean(form.email),
      address: clean(form.address),
      city: clean(form.city),
      province: clean(form.province),
      postalCode: clean(form.postalCode).toUpperCase(),
    },
    cardLast4: digitsOnly(form.cardNumber).slice(-4),
  };
}

const Checkout = { HST_RATE, PROVINCES, calculateOrderTotals, validateCheckout, createOrder };

if (typeof window !== "undefined") {
  window.Checkout = Checkout;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Checkout;
}
