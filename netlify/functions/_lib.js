import { getStore } from "@netlify/blobs";

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export function requireAdmin(request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return json({ error: "Configure ADMIN_PASSWORD nas variáveis do Netlify antes de usar." }, 503);
  const supplied = request.headers.get("x-admin-password") || "";
  if (supplied.length !== expected.length || supplied !== expected) {
    return json({ error: "Senha incorreta ou sessão não autenticada." }, 401);
  }
  return null;
}

export function queueStore() {
  return getStore({ name: "shopee-queue", consistency: "strong" });
}

export function makeId() {
  return globalThis.crypto.randomUUID();
}

export function cleanText(value, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
