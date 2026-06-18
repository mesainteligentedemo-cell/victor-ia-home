#!/usr/bin/env python3
"""
Agrega converter.js a artículos que lo necesitan
"""
from pathlib import Path

BLOG_DIR = Path("C:/Users/inbou/victor-ia-home/blog")
SCRIPT_TAG = '<script src="/blog/js/converter.js"><\/script>'

def add_converter_js():
    articles = sorted([f for f in BLOG_DIR.glob("*.html")
        if f.name not in ['index.html', 'blog-premium.html', 'article.html']])

    updated = 0
    for article_file in articles:
        with open(article_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Si ya tiene converter.js, skip
        if 'converter.js' in content:
            continue

        # Agregar script antes de </body>
        if '</body>' in content:
            content = content.replace('</body>', f'{SCRIPT_TAG}\n</body>')
            with open(article_file, 'w', encoding='utf-8') as f:
                f.write(content)
            updated += 1
            print(f"+ {article_file.name}")

    print(f"\nAgregados a {updated} articulos")

if __name__ == "__main__":
    add_converter_js()
