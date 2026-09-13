# MAZIK · Presskit

Site estático de uma página: `index.html` com CSS e JS embutidos, imagens em `assets/`.

- **Texto e idiomas:** a fonte da verdade é o objeto `COPY` dentro de `index.html` (PT, ES, EN).
  O português também fica pré-renderizado no HTML para buscadores e prévias de link.
  Depois de mudar qualquer texto em `COPY`, rode `node scripts/prerender.js` e commite o resultado.
- **Publicação:** Cloudflare Pages, projeto `mazik`, domínio mazik.com.br, por upload direto do conteúdo da `main`.
