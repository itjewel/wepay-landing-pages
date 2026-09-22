// POST /api/wepay4u/checkout  body: { cart: [{ id, quantity }] }
// Prices are taken from CATALOG, not from the browser, so nobody can change them.
import { CATALOG, calcTotals } from "../../shared/pricing.js";
import { wepay4uFetch, setCors } from "../_lib/wepay4u.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(404).json({ message: "Not found" });

  try {
    const { cart = [] } = req.body || {};

    const items = cart
      .filter((line) => CATALOG[line.id] && Number.isInteger(line.quantity) && line.quantity > 0)
      .map((line) => ({ ...CATALOG[line.id], quantity: line.quantity }));
    if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const { shipping, vat } = calcTotals(items);
    const lines = items.map((i) => ({ name: i.name, quantity: i.quantity, unit_price_minor: i.price * 100 }));
    if (shipping > 0) lines.push({ name: "Shipping", quantity: 1, unit_price_minor: shipping * 100 });
    if (vat > 0) lines.push({ name: "VAT", quantity: 1, unit_price_minor: vat * 100 });

    // amount_minor must equal the sum of all lines
    const amountMinor = lines.reduce((sum, l) => sum + l.quantity * l.unit_price_minor, 0);
    const orderId = `ORDER-${Date.now()}`;
    const shopUrl = process.env.SHOP_URL || "http://localhost:5173";

    const session = await wepay4uFetch("/checkout/sessions", {
      method: "POST",
      body: JSON.stringify({
        merchant_order_id: orderId,
        amount_minor: amountMinor,
        items: lines,
        success_url: `${shopUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${shopUrl}/cart`,
      }),
    });

    console.log(`Created session for ${orderId} (৳${amountMinor / 100})`);
    res.status(200).json({ url: session.url, orderId });
  } catch (err) {
    console.error(err.message);
    res.status(err.status && err.status < 500 ? err.status : 502).json({ message: err.message });
  }
}
