import { useEffect, useState } from "react";
import { SHOP_API } from "../config";

export default function SuccessPage() {
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  const [state, setState] = useState(() =>
    sessionId ? { loading: true } : { error: "No session_id in the URL." }
  );

  useEffect(() => {
    if (!sessionId) return;
    // Verify on the server — a session_id in the URL alone does not prove payment.
    fetch(`${SHOP_API}/api/wepay4u/session/${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Verification failed");
        if (data.paid) localStorage.removeItem("cartItems");
        setState(data);
      })
      .catch((err) => setState({ error: err.message }));
  }, [sessionId]);

  return (
    <div className="success-page">
      <div className="success-card">
        {state.loading && <h2>⏳ Verifying payment…</h2>}

        {state.error && (
          <>
            <h2>⚠️ Could not verify payment</h2>
            <p>{state.error}</p>
          </>
        )}

        {state.paid === true && (
          <>
            <div className="success-icon">✅</div>
            <h2>Payment confirmed</h2>
            <p>
              Order <strong>{state.orderId}</strong> is paid
              {state.amountMinor != null && <> — ৳{(state.amountMinor / 100).toLocaleString()}</>}.
            </p>
            <p>We are preparing your delivery.</p>
          </>
        )}

        {state.paid === false && (
          <>
            <h2>Payment not completed</h2>
            <p>
              Status: <strong>{state.status}</strong>
            </p>
          </>
        )}

        <a href="/" className="primary-btn">
          Back to shop
        </a>
      </div>
    </div>
  );
}
