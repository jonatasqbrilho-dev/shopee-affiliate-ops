import { json, requireAdmin, queueStore, makeId, cleanText } from "./_lib.js";

export default async function handler(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const store = queueStore();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    if (request.method === "GET") {
      const { blobs } = await store.list({ prefix: "items/" });
      const items = [];
      for (const blob of blobs) {
        const item = await store.get(blob.key, { type: "json", consistency: "strong" });
        if (item) items.push(item);
      }
      items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      return json({ items });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const title = cleanText(body.title, 180);
      const productUrl = cleanText(body.productUrl, 2000);
      const videoUrl = cleanText(body.videoUrl, 2000);
      const description = cleanText(body.description, 2000);
      if (!title) return json({ error: "Informe o nome do produto ou vídeo." }, 400);
      for (const value of [productUrl, videoUrl]) {
        if (value && !/^https?:\/\//i.test(value)) return json({ error: "Os links devem começar com http:// ou https://." }, 400);
      }
      const item = {
        id: makeId(), title, productUrl, videoUrl, description,
        status: "Pendente", createdAt: new Date().toISOString()
      };
      await store.setJSON("items/" + item.id + ".json", item);
      return json({ item }, 201);
    }

    if (request.method === "PATCH") {
      if (!id) return json({ error: "Falta o parâmetro id." }, 400);
      const key = "items/" + id + ".json";
      const item = await store.get(key, { type: "json", consistency: "strong" });
      if (!item) return json({ error: "Item não encontrado." }, 404);
      const body = await request.json();
      const allowed = ["Pendente", "Enviado ao Telegram", "Publicado manualmente", "Arquivado"];
      if (body.status && !allowed.includes(body.status)) return json({ error: "Status inválido." }, 400);
      if (body.status) item.status = body.status;
      if (body.title !== undefined) item.title = cleanText(body.title, 180);
      if (body.productUrl !== undefined) item.productUrl = cleanText(body.productUrl, 2000);
      if (body.videoUrl !== undefined) item.videoUrl = cleanText(body.videoUrl, 2000);
      if (body.description !== undefined) item.description = cleanText(body.description, 2000);
      item.updatedAt = new Date().toISOString();
      await store.setJSON(key, item);
      return json({ item });
    }

    if (request.method === "DELETE") {
      if (!id) return json({ error: "Falta o parâmetro id." }, 400);
      await store.delete("items/" + id + ".json");
      return json({ ok: true });
    }

    return json({ error: "Método não permitido." }, 405);
  } catch (error) {
    return json({ error: "Falha ao acessar a fila. Confira os logs do Netlify.", detail: String(error?.message || error) }, 500);
  }
}
