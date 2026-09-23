// Shared helper for the api/wepay4u/* serverless functions.
// The secret key is read from Vercel's Environment Variables, never from the client.
const WEPAY4U_API = process.env.WEPAY4U_API || "http://localhost:8080/api/v1";
const WEPAY4U_SECRET = process.env.WEPAY4U_SECRET;

export async function wepay4uFetch(path, options = {}) {
  if (!WEPAY4U_SECRET || WEPAY4U_SECRET.includes("paste")) {
    throw Object.assign(new Error("WEPAY4U_SECRET is missing. Set it in the Vercel project's Environment Variables."), {
      status: 500,
    });
  }

  const url = `${WEPAY4U_API}${path}`;
  console.log(`[wepay4u debug] fetching ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", "X-Api-Key": WEPAY4U_SECRET },
  });
  const rawText = await res.text();
  console.log(`[wepay4u debug] status=${res.status} body=${rawText.slice(0, 300)}`);
  let json = {};
  try {
    json = JSON.parse(rawText || "{}");
  } catch {
    json = {};
  }
  if (!res.ok || json.success === false) {
    throw Object.assign(new Error(json.message || `WePay4U error ${res.status}`), { status: res.status });
  }
  return json.data;
}

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.SHOP_URL || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}
