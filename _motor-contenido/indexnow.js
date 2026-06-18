#!/usr/bin/env node
/*
 * INDEXNOW — Notifica URLs a Bing/Yandex (y Google adoptándolo) para indexación instantánea.
 *
 * USO:
 *   node indexnow.js                  → envía TODAS las URLs del sitemap
 *   node indexnow.js url1 url2 ...     → envía solo las URLs indicadas (para contenido nuevo del día)
 *
 * Ejecutar después de cada deploy de contenido nuevo.
 */
const https = require("https");
const { execSync } = require("child_process");

const KEY = "victoriaxyzcaa08e9638a2f9e872b75";
const HOST = "victor-ia.xyz";

let urls = process.argv.slice(2);
if (urls.length === 0) {
  // sin args → todas las del sitemap
  const xml = execSync(`curl -s https://${HOST}/sitemap.xml`, { encoding: "utf8", maxBuffer: 5e6 });
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
} else {
  // normalizar: si pasan slugs, anteponer dominio
  urls = urls.map(u => u.startsWith("http") ? u : `https://${HOST}/${u.replace(/^\//, "")}`);
}

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urls,
});
const data = Buffer.from(payload);

const req = https.request({
  hostname: "api.indexnow.org", path: "/indexnow", method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": data.length },
}, res => {
  let body = ""; res.on("data", c => body += c);
  res.on("end", () => {
    const ok = res.statusCode === 200 || res.statusCode === 202;
    console.log(`IndexNow: HTTP ${res.statusCode} — ${urls.length} URLs ${ok ? "✓ enviadas a Bing/Yandex" : "REVISAR"}${body ? " — " + body.slice(0,80) : ""}`);
  });
});
req.on("error", e => console.log("error:", e.message));
req.write(data); req.end();
