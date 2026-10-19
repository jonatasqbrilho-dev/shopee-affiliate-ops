# Configuração no Netlify

## 1. Conectar o repositório
- No Netlify, abra o site e selecione Deploys / Site configuration / Build settings.
- Repositório: jonatasqbrilho-dev/shopee-affiliate-ops.
- Branch recomendada para testar: netlify-js-migration.
- Build command: npm install
- Publish directory: public
- Functions directory: netlify/functions (já definido em netlify.toml).

## 2. Variáveis de ambiente
Em Site configuration > Environment variables, adicione:
- ADMIN_PASSWORD: crie uma senha forte e exclusiva.
- TELEGRAM_BOT_TOKEN: token do BotFather (mantenha secreto).
- TELEGRAM_CHAT_ID: @nome_do_canal ou ID numérico do canal.

Nunca coloque tokens no código nem os envie em mensagens públicas. O bot precisa ser administrador do canal e ter permissão para publicar mensagens.

## 3. Teste
- Abra https://SEU-SITE/.netlify/functions/health. Deve retornar JSON com ok:true.
- Abra a página principal, entre com ADMIN_PASSWORD e adicione um item de teste.
- Teste primeiro uma mensagem sem vídeo. Depois teste vídeo somente com uma URL pública direta que o Telegram consiga buscar.

## Limitações atuais
- A fila guarda metadados e URLs; não faz upload/armazenamento de vídeo nesta primeira versão.
- Envio Telegram é acionado manualmente por item.
- TikTok não publica automaticamente: a API oficial exige elegibilidade, autorização e fluxo OAuth; use publicação manual enquanto isso não estiver configurado.
- A API Python original e os fluxos n8n continuam no repositório, mas ainda não foram migrados para JavaScript.
- Netlify Blobs é armazenamento de objetos simples, não banco transacional; esta versão é adequada para uma fila pequena e uso individual. Para vários usuários editando simultaneamente, use banco de dados.
