# MAZIK · Presskit

Site estático de uma página: `index.html` com CSS e JS embutidos, imagens em `assets/`.

- **Texto e idiomas:** a fonte da verdade é o objeto `COPY` dentro de `index.html` (PT, ES, EN).
  O português também fica pré-renderizado no HTML para buscadores e prévias de link.
  Depois de mudar qualquer texto em `COPY`, rode `node scripts/prerender.js` e commite o resultado.
- **Publicação:** Cloudflare Pages, projeto `mazik`, domínio mazik.com.br, por upload direto do conteúdo da `main`.

## O que mais está no ar e não mora aqui

- **`_worker.js`** (blog, editor `/admin`, Academia, API de eventos): a fonte fica no banco D1 `mazik-blog`, tabela `_site_parts` (chaves `src`, `index`, `admin`, `beat`). Todo deploy precisa incluir o worker, senão `/blog`, `/academia` e o editor caem (foi o que aconteceu em 29/09/2026).
- **`oi.html` e `assets/qr/`**: landing do QR code, publicada por upload manual em 29/09/2026. Ainda não estão neste repositório; o deploy reaproveita os arquivos já publicados.

## Medição

A página envia eventos sem cookies para `/api/evento` (visita com referrer e UTM, cliques em WhatsApp, e-mail, telefone, press kit, players e redes). Ficam na tabela `eventos` do D1.

## Imagens

Cada imagem tem uma versão `.webp` ao lado, servida por `<picture>`. Ao trocar uma imagem, gere a `.webp` de novo (qualidade 80 para fotos, 85 para ilustrações com transparência).
