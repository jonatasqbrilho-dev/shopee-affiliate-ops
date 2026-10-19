import { json, requireAdmin, queueStore } from "./_lib.js";

export default async function handler(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return json({ error: "Configure TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID nas variáveis do Netlify." }, 503);

  try {
    const { id } = await request.json();
    if (!id) return json({ error: "Informe o ID do item." }, 400);
    const store = queueStore();
    const key = "items/" + id + ".json";
    const item = await store.get(key, { type: "json", consistency: "strong" });
    if (!item) return json({ error: "Item não encontrado na fila." }, 404);

    const lines = ["🔥 " + item.title];
    if (item.description) lines.push("", item.description);
    if (item.productUrl) lines.push("", "🛒 Comprar: " + item.productUrl);
    if (item.videoUrl) lines.push("", "🎬 Vídeo: " + item.videoUrl);
    lines.push("", "📣 Ofertas24horas");
    const message = lines.join("\n");

    let endpoint = "sendMessage";
    let payload = { chat_id: chatId, text: message, disable_web_page_preview: false };
    if (item.videoUrl) {
      endpoint = "sendVideo";
      payload = { chat_id: chatId, video: item.videoUrl, caption: message.slice(0, 1024) };
    }
    const response = await fetch("https://api.telegram.org/bot" + token + "/" + endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      return json({ error: result.description || "Telegram recusou o envio. Confira se o bot é administrador do canal e se o link do vídeo é acessível." }, 502);
    }
    item.status = "Enviado ao Telegram";
    item.telegramSentAt = new Date().toISOString();
    await store.setJSON(key, item);
    return json({ ok: true, status: item.status, telegram: "Mensagem enviada." });
  } catch (error) {
    return json({ error: "Não foi possível enviar ao Telegram.", detail: String(error?.message || error) }, 500);
  }
}
