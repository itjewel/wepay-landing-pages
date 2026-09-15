// Shop backend for WePay4U. The secret key lives only here (.env), never in React.
// Run: npm run server
import http from "node:http";
import { CATALOG, calcTotals } from "../shared/pricing.js";

const PORT = process.env.PORT || 4000;
const SHOP_URL = process.env.SHOP_URL || "http://localhost:5173";
const WEPAY4U_API = process.env.WEPAY4U_API || "http://localhost:8080/api/v1";
const WEPAY4U_SECRET = process.env.WEPAY4U_SECRET;

if (!WEPAY4U_SECRET || WEPAY4U_SECRET.includes("paste")) {
  console.error("WEPAY4U_SECRET is missing. Paste your sk_test_… key in .env — the server restarts on save.");
  process.exit(1);
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": SHOP_URL,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

async function wepay4u(path, options = {}) {
  const res = await fetch(`${WEPAY4U_API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "X-Api-Key": WEPAY4U_SECRET },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw Object.assign(new Error(json.message || `WePay4U error ${res.status}`), { status: res.status });
  }
  return json.data;
}

// POST /api/wepay4u/checkout  body: { cart: [{ id, quantity }] }
// Prices are taken from CATALOG, not from the browser, so nobody can change them.
async function createCheckout(req, res) {
  const { cart = [] } = await readJson(req);

  const items = cart
    .filter((line) => CATALOG[line.id] && Number.isInteger(line.quantity) && line.quantity > 0)
    .map((line) => ({ ...CATALOG[line.id], quantity: line.quantity }));
  if (items.length === 0) return send(res, 400, { message: "Cart is empty" });

  const { shipping, vat } = calcTotals(items);
  const lines = items.map((i) => ({ name: i.name, quantity: i.quantity, unit_price_minor: i.price * 100 }));
  if (shipping > 0) lines.push({ name: "Shipping", quantity: 1, unit_price_minor: shipping * 100 });
  if (vat > 0) lines.push({ name: "VAT", quantity: 1, unit_price_minor: vat * 100 });

  // amount_minor must equal the sum of all lines
  const amountMinor = lines.reduce((sum, l) => sum + l.quantity * l.unit_price_minor, 0);
  const orderId = `ORDER-${Date.now()}`;

  const session = await wepay4u("/checkout/sessions", {
    method: "POST",
    body: JSON.stringify({
      merchant_order_id: orderId,
      amount_minor: amountMinor,
      items: lines,
      success_url: `${SHOP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SHOP_URL}/cart`,
    }),
  });

  console.log(`Created session for ${orderId} (৳${amountMinor / 100})`);
  send(res, 200, { url: session.url, orderId });
}

// GET /api/wepay4u/session/:id — never trust the session_id in the URL alone; ask WePay4U.
async function verifySession(res, sessionId) {
  const session = await wepay4u(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
  const paid = session.status === "completed";
  if (paid) {
    // ✅ Mark the order paid in your database and start delivery here.
    console.log(`Order ${session.merchant_order_id} PAID`);
  }
  send(res, 200, {
    paid,
    status: session.status,
    orderId: session.merchant_order_id,
    amountMinor: session.amount_minor,
  });
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      if (req.method === "OPTIONS") return send(res, 204, {});
      if (req.method === "POST" && url.pathname === "/api/wepay4u/checkout") return await createCheckout(req, res);
      const match = url.pathname.match(/^\/api\/wepay4u\/session\/([^/]+)$/);
      if (req.method === "GET" && match) return await verifySession(res, match[1]);
      send(res, 404, { message: "Not found" });
    } catch (err) {
      console.error(err.message);
      send(res, err.status && err.status < 500 ? err.status : 502, { message: err.message });
    }
  })
  .listen(PORT, () => console.log(`Shop server on http://localhost:${PORT} → ${WEPAY4U_API}`));
