#!/usr/bin/env python3
"""
Corrige la estructura de portadas en artículos:
1. Reemplaza /img/blog-covers/*.png con /blog/covers/*.webp
2. Mueve article-cover al inicio (antes del contenido)
"""
import re
from pathlib import Path

BLOG_DIR = Path("C:/Users/inbou/victor-ia-home/blog")

def fix_article_structure(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # Extraer el slug del nombre del archivo
    slug = filepath.stem

    # 1. Reemplazar /img/blog-covers/CUALQUIER.png con /blog/covers/{slug}.webp
    # Patrón: <img src="/img/blog-covers/[^"]+\.png"
    content = re.sub(
        r'<img\s+src="/img/blog-covers/[^"]+\.png"[^>]*>',
        f'<img src="/blog/covers/{slug}.webp" alt="{slug}" loading="eager" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:36px" class="rv"/>',
        content,
        count=1
    )

    # 2. Si no había imagen anterior, insertar el article-cover al inicio del <div class="prose">
    if '/img/blog-covers/' not in original and '<div class="article-cover">' not in content:
        # Buscar el primer <div class="prose">
        prose_match = re.search(r'(<div\s+class="prose">)', content)
        if prose_match:
            insert_pos = prose_match.end()
            article_cover_html = f'\n<img src="/blog/covers/{slug}.webp" alt="{slug}" loading="eager" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:36px" class="rv"/>'
            content = content[:insert_pos] + article_cover_html + content[insert_pos:]

    # 3. Remover article-cover del interior si existe
    content = re.sub(
        r'<div\s+class="article-cover">[^<]*<img[^>]*class="article-cover"[^>]*>[^<]*</div>',
        '',
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    articles = sorted([f for f in BLOG_DIR.glob("*.html")
        if f.name not in ['index.html', 'blog-premium.html', 'article.html']])

    print("\n" + "="*70)
    print("CORRIGIENDO PORTADAS EN ARTÍCULOS")
    print("="*70 + "\n")

    fixed = 0
    for article in articles:
        if fix_article_structure(article):
            fixed += 1
            print(f"OK {article.name}")

    print(f"\n{fixed}/{len(articles)} articulos corregidos\n")

if __name__ == "__main__":
    main()
