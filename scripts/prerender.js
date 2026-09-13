#!/usr/bin/env node
// Pré-renderiza o texto em português dentro do index.html.
// O JS da página continua trocando o idioma em tempo de execução, mas o HTML
// entregue ao Google, às prévias de link e a quem está sem JS já vem com o
// texto em PT. Rode depois de qualquer mudança no COPY:  node scripts/prerender.js
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(file, "utf8");

const src = html.match(/<script>\n([\s\S]*?)<\/script>\n<\/body>/)[1];
const grab = (name) => {
  const m = src.match(new RegExp(`const ${name} = ([\\s\\S]*?);\\n(?=const |function |\\n)`));
  if (!m) throw new Error("não achei " + name);
  return new Function("return " + m[1])();
};
const COPY = grab("COPY"), PHONE = grab("PHONE"), EMAIL = grab("EMAIL");
const pt = COPY.pt;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let n = 0;
html = html.replace(/(<(\w+)\b[^>]*\bdata-i18n="([\w-]+)"[^>]*>)([^<]*)(<\/\2>)/g, (all, open, tag, key, inner, close) => {
  if (pt[key] === undefined) return all;
  n++;
  return open + esc(pt[key]) + close;
});
const total = (html.match(/data-i18n="/g) || []).length;
if (n !== total) throw new Error(`preenchi ${n} de ${total} elementos data-i18n; algum tem filhos ou chave inexistente`);

html = html.replace(/(<button type="button" class="chip" data-tpl="(\w+)"[^>]*>)([^<]*)(<\/button>)/g, (all, open, tpl, inner, close) => {
  const t = pt.tpl[tpl]; if (!t) throw new Error("template sem cópia: " + tpl);
  return open + esc(t.label) + close;
});
const booking = pt.tpl.booking;
html = html.replace(/(<a id="wa-cta" href=")[^"]*(")/, `$1https://wa.me/${PHONE}?text=${encodeURIComponent(booking.msg)}$2`);
html = html.replace(/(<a id="wa-bar" class="wa-bar" href=")[^"]*(")/, `$1https://wa.me/${PHONE}?text=${encodeURIComponent(booking.msg)}$2`);
html = html.replace(/(<a id="mail-link" href=")[^"]*(")/, `$1mailto:${EMAIL}?subject=${encodeURIComponent(booking.subject)}$2`);
html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(pt.title)}</title>`);

fs.writeFileSync(file, html);
console.log(`ok: ${n} textos, ${Object.keys(pt.tpl).length} chips, título "${pt.title}"`);
