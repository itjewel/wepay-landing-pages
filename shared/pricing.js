// Shared by the React app and the server, so the price the customer sees
// is exactly the price the server sends to WePay4U.

export const CATALOG = {
  1: { name: "Premium Wireless Headphone", price: 2499 },
  2: { name: "Smart Watch Pro", price: 3999 },
  3: { name: "Classic Sneakers", price: 2899 },
  4: { name: "Leather Backpack", price: 2199 },
};

// items: [{ price, quantity }] — amounts in taka
export function calcTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 3000 ? 0 : subtotal > 0 ? 60 : 0;
  const vat = Math.round(subtotal * 0.05); // 5% VAT
  const total = subtotal + shipping + vat;
  return { subtotal, shipping, vat, total };
}
