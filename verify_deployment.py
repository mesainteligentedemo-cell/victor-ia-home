#!/usr/bin/env python3
"""
Verifica que todo está listo para el deploy
"""
import os
from pathlib import Path
import re

BLOG_DIR = Path("C:/Users/inbou/victor-ia-home/blog")

def check_cover_files():
    """Verifica que existen los archivos .webp"""
    covers = list(BLOG_DIR.glob("covers/*.webp"))
    return len(covers)

def check_html_articles():
    """Verifica que los HTMLs referencian las portadas correctamente"""
    articles = list(BLOG_DIR.glob("*.html"))
    articles = [f for f in articles if f.name not in ['index.html', 'blog-premium.html', 'article.html']]

    missing_covers = []
    for article_file in articles:
        with open(article_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Buscar referencias a /blog/covers/
        covers_found = re.findall(r'/blog/covers/([^"]+\.webp)', content)
        if not covers_found:
            missing_covers.append(article_file.name)

    return len(articles), missing_covers

def check_converter_js():
    """Verifica que converter.js está siendo cargado"""
    articles = list(BLOG_DIR.glob("*.html"))
    articles = [f for f in articles if f.name not in ['index.html', 'blog-premium.html', 'article.html']]

    missing_js = []
    for article_file in articles:
        with open(article_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if 'converter.js' not in content:
            missing_js.append(article_file.name)

    return len(articles), missing_js

def main():
    print("\n" + "="*70)
    print("VERIFICACION PRE-DEPLOY - Victor IA Blog")
    print("="*70 + "\n")

    # Check 1: Portadas
    covers_count = check_cover_files()
    print(f"[1/3] Archivos .webp: {covers_count} encontrados")
    if covers_count >= 130:
        print("      OK - Suficientes portadas\n")
    else:
        print(f"      WARNING - Solo {covers_count} portadas\n")

    # Check 2: Referencias HTML
    articles_count, missing_covers = check_html_articles()
    print(f"[2/3] Referencias a portadas en HTMLs:")
    print(f"      {articles_count - len(missing_covers)}/{articles_count} articulos OK")
    if missing_covers:
        print(f"      FAIL - {len(missing_covers)} articulos sin referencias a portadas")
        for f in missing_covers[:5]:
            print(f"        - {f}")
    else:
        print("      OK - Todos los articulos tienen referencias\n")

    # Check 3: converter.js
    articles_count, missing_js = check_converter_js()
    print(f"[3/3] Carga de converter.js:")
    print(f"      {articles_count - len(missing_js)}/{articles_count} articulos OK")
    if missing_js:
        print(f"      FAIL - {len(missing_js)} articulos sin converter.js")
    else:
        print("      OK - Todos los articulos cargan converter.js\n")

    # Resumen
    print("="*70)
    if not missing_covers and not missing_js and covers_count >= 130:
        print("LISTO PARA DEPLOY")
    else:
        print("PROBLEMAS DETECTADOS - REVISA LOS LOGS")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
