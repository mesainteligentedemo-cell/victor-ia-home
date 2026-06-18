const fs = require("fs");
const path = require("path");
const BLOG = path.join(__dirname, "blog");
const COVERS = path.join("C:", "Users", "inbou", "victor-ia-website", "img", "blog-covers");
const covers = new Set(fs.readdirSync(COVERS).filter(f => f.endsWith(".png")).map(f => f.replace(".png", "")));
const h = fs.readFileSync(path.join(BLOG, "index.html"), "utf8");
const cards = [...h.matchAll(/<a href="([a-z][a-zA-Z0-9-]+)\.html"[^>]*class="blog-card[^>]*>([\s\S]*?)<\/a>/g)];
const noCover = [];
for (const c of cards) {
  const slug = c[1];
  if (!/img src="\/img\/blog-covers/.test(c[2])) {
    noCover.push({ slug, hasFile: covers.has(slug) });
  }
}
console.log("Cards sin <img> portada:", noCover.length);
noCover.forEach(x => console.log("  " + x.slug.padEnd(42) + (x.hasFile ? "(PNG ya existe → solo cambiar card)" : "(falta generar PNG)")));
fs.writeFileSync(path.join(BLOG, "_nocover.txt"), noCover.map(x => x.slug).join("\n"));
