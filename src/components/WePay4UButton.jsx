import { useEffect, useRef } from "react";
import { SHOP_API } from "../config";

// Renders the official "Pay with WePay4U" button (wepay4u.js is loaded in index.html).
// Only product ids + quantities go to our server; the server prices them and holds the secret key.
export default function WePay4UButton({ items }) {
  const containerRef = useRef(null);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!window.WePay4U) {
      containerRef.current.textContent = "WePay4U script failed to load. Check https://wepay4u.org/wepay4u.js is reachable.";
      return;
    }

    window.WePay4U.button(containerRef.current, {
      block: true,
      createSession: async () => {
        let res;
        try {
          res = await fetch(`${SHOP_API}/api/wepay4u/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cart: itemsRef.current.map((i) => ({ id: i.id, quantity: i.quantity })),
            }),
          });
        } catch {
          throw new Error(
            SHOP_API
              ? `Shop server is not running at ${SHOP_API}. Start it with: npm run server`
              : "Could not reach /api/wepay4u/checkout. Run with `vercel dev`, or set VITE_SHOP_API and run `npm run server`."
          );
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not start WePay4U checkout");
        return data.url; // the button redirects the customer there
      },
    });
  }, []);

  return <div ref={containerRef} className="wepay4u-button-wrap" />;
}
