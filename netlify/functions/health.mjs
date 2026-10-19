import { json } from "./_lib.js";

export default async function handler() {
  return json({
    ok: true,
    service: "Shopee Affiliate Ops - Netlify Functions",
    version: "1.0.0",
    note: "Configure ADMIN_PASSWORD and TELEGRAM_BOT_TOKEN in Netlify environment variables."
  });
}
