// GET /api/wepay4u/session/:id — never trust the session_id in the URL alone; ask WePay4U.
import { wepay4uFetch, setCors } from "../../_lib/wepay4u.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(404).json({ message: "Not found" });

  const { id } = req.query;

  try {
    const session = await wepay4uFetch(`/checkout/sessions/${encodeURIComponent(id)}`);
    const paid = session.status === "completed";
    if (paid) {
      // ✅ Mark the order paid in your database and start delivery here.
      console.log(`Order ${session.merchant_order_id} PAID`);
    }
    res.status(200).json({
      paid,
      status: session.status,
      orderId: session.merchant_order_id,
      amountMinor: session.amount_minor,
    });
  } catch (err) {
    console.error(err.message);
    res.status(err.status && err.status < 500 ? err.status : 502).json({ message: err.message });
  }
}
