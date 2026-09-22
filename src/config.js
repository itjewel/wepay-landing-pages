// Our shop backend (api/wepay4u/*), not WePay4U — the secret key stays there.
// Empty string = same-origin relative calls, which is correct on Vercel and
// under `vercel dev`. Only set VITE_SHOP_API when running the old two-terminal
// `npm run dev` + `npm run server` local flow (server/index.js on :4000).
export const SHOP_API = import.meta.env.VITE_SHOP_API || "";
