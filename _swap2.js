const fs = require("fs");
const path = require("path");
const BLOG = path.join(__dirname, "blog");
const COVERS = path.join("C:", "Users", "inbou", "victor-ia-website", "img", "blog-covers");
const covers = new Set(fs.readdirSync(COVERS).filter(f => f.endsWith(".png")).map(f => f.replace(".png", "")));

const slugs = fs.readFileSync(path.join(BLOG, "_nocover.txt"), "utf8").trim().split(/\r?\n/).filter(Boolean);

let html = fs.readFileSync(path.join(BLOG, "index.html"), "utf8");
let swapped = 0, skip = [];

for (const slug of slugs) {
  if (!covers.has(slug)) { skip.push(slug + " (sin PNG)"); continue; }

  const anchorStart = html.indexOf(`<a href="${slug}.html" class="blog-card`);
  if (anchorStart === -1) { skip.push(slug + " (no anchor)"); continue; }
  const cardEnd = html.indexOf("</a>", anchorStart);
  const card = html.slice(anchorStart, cardEnd);

  // gradient div (both the article-card style and the news/futuro h2 style)
  const gradRe = /<div style="aspect-ratio:16\/9;background:linear-gradient\(135deg,#0c0a18,#1a1035\)[^"]*">\s*<span[^>]*>Victor IA<\/span>\s*<\/div>/;

  const titleMatch = card.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
  const title = titleMatch ? titleMatch[1].replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim() : slug;
  const altEsc = title.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const imgTag = `<img src="/img/blog-covers/${slug}.png" alt="${altEsc}" loading="lazy" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:8px;display:block;margin-bottom:20px;">`;

  if (gradRe.test(card)) {
    const newCard = card.replace(gradRe, imgTag);
    html = html.slice(0, anchorStart) + newCard + html.slice(cardEnd);
    swapped++;
  } else {
    skip.push(slug + " (no gradient div)");
  }
}

fs.writeFileSync(path.join(BLOG, "index.html"), html);
console.log("cards swapeadas a imagen:", swapped);
if (skip.length) console.log("no swapeadas:\n  " + skip.join("\n  "));
