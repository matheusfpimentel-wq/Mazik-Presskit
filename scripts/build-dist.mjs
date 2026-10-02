#!/usr/bin/env node
// Monta a pasta dist/ que vai para o Cloudflare Pages.
// 1. Copia o site do repositório (sem .git, .github, scripts, README).
// 2. Gera o _worker.js a partir do banco D1 (tabela _site_parts): blog, editor, Academia e eventos.
// 3. Garante que oi.html e assets/qr/ existam (se não estiverem no repositório, copia do site no ar).
// Para sem publicar se faltar o worker ou o /oi.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DB = "2ab23840-c63b-4d51-ae23-09cb4a9ebd1a";
const SKIP = new Set([".git", ".github", "scripts", "README.md", "dist", "node_modules", ".DS_Store"]);

fs.rmSync(DIST, { recursive: true, force: true });
const copy = (from, to) => {
  for (const f of fs.readdirSync(from)) {
    if (SKIP.has(f)) continue;
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) { fs.mkdirSync(b, { recursive: true }); copy(a, b); }
    else { fs.mkdirSync(to, { recursive: true }); fs.copyFileSync(a, b); }
  }
};
copy(ROOT, DIST);

// _worker.js a partir do D1
if (!ACCOUNT || !TOKEN) throw new Error("Faltam CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN.");
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/d1/database/${DB}/query`, {
  method: "POST",
  headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
  body: JSON.stringify({ sql: "SELECT k, v FROM _site_parts" }),
});
const j = await r.json();
if (!j.success) throw new Error("Não consegui ler o worker no D1: " + JSON.stringify(j.errors));
const parts = Object.fromEntries(j.result[0].results.map((x) => [x.k, x.v]));
for (const k of ["src", "index", "admin", "beat"]) if (!parts[k]) throw new Error("Parte do worker ausente no D1: " + k);
const marker = "/* PAGES:start */\nconst PAGES = {};\n/* PAGES:end */";
if (!parts.src.includes(marker)) throw new Error("Marcador PAGES ausente no worker.");
const PAGES = { "/admin": parts.admin, "/academia": parts.index, "/academia/beatmatch": parts.beat };
fs.writeFileSync(path.join(DIST, "_worker.js"), parts.src.replace(marker, `/* PAGES:start */\nconst PAGES = ${JSON.stringify(PAGES)};\n/* PAGES:end */`));
console.log("ok: _worker.js gerado a partir do D1");

// /oi e assets/qr (landing do QR code)
const LIVE = ["oi.html", "assets/qr/cdj.png", "assets/qr/cone.png", "assets/qr/hero.jpg", "assets/qr/jaguar.png", "assets/qr/mazik-tag.svg", "assets/qr/planta.png"];
for (const f of LIVE) {
  const dest = path.join(DIST, f);
  if (fs.existsSync(dest)) continue;
  const res = await fetch("https://mazik.com.br/" + (f === "oi.html" ? "oi" : f));
  if (!res.ok) throw new Error(`Não achei ${f} no repositório nem no site (${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (f === "oi.html" && !buf.toString("utf8").includes("prazer")) throw new Error("O /oi no ar não parece a landing do QR; parei para não sobrescrever.");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(`aviso: ${f} veio do site no ar; vale commitar no repositório`);
}
console.log("ok: dist/ pronta");
