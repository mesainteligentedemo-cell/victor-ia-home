#!/usr/bin/env python3
"""
Remueve class="rv" de las img de portadas para que se muestren inmediatamente
"""
import re
from pathlib import Path

BLOG_DIR = Path("C:/Users/inbou/victor-ia-home/blog")

articles = [f for f in BLOG_DIR.glob("*.html")
    if f.name not in ['index.html', 'blog-premium.html', 'article.html']]

fixed = 0
for article in articles:
    with open(article, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Remover class="rv" solo de las primeras 2 imagenes (portadas)
    # Patrón: <img src="/blog/covers/...webp"...class="rv"
    matches = list(re.finditer(r'<img[^>]*src="/blog/covers/[^"]+\.webp"[^>]*class="rv"[^>]*/?>', content))
    
    if matches:
        # Reemplazar solo las primeras 2 ocurrencias
        for match in matches[:2]:
            old = match.group(0)
            new = old.replace(' class="rv"', '').replace('class="rv" ', '')
            content = content.replace(old, new, 1)
        
        with open(article, 'w', encoding='utf-8') as f:
            f.write(content)
        fixed += 1
        print(f"{article.name}")

print(f"\nFijos: {fixed} articulos")
