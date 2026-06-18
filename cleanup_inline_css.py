#!/usr/bin/env python3
"""
Limpia CSS inline duplicado + HTML del modal converter de 113 archivos HTML
Remueve ~80 líneas de .converter-modal, .converter-form, etc. de cada archivo
"""
import os
import re
from pathlib import Path

BLOG_DIR = Path("C:/Users/inbou/victor-ia-home/blog")
BACKUP_DIR = BLOG_DIR / ".backups"

# Crear directorio de backups
BACKUP_DIR.mkdir(exist_ok=True)

def clean_html_file(filepath):
    """Limpia un archivo HTML removiendo CSS inline y HTML del modal"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_size = len(content)

    # 1. Remover bloques de <style> que contienen .converter-modal
    # Patrón: <style>...converter-modal...converter-privacy...</style>
    content_cleaned = re.sub(
        r'<style[^>]*>[\s\S]*?\.converter-modal[\s\S]*?\.converter-privacy[\s\S]*?</style>',
        '',
        content
    )

    # 2. Remover inline <style> con converter CSS (alternativa si está en otro formato)
    content_cleaned = re.sub(
        r'<style[^>]*>[\s\S]*?\.converter-close[\s\S]*?</style>',
        '',
        content_cleaned
    )

    # 3. Remover div id="converter-modal" completo (con el modal HTML inyectado)
    content_cleaned = re.sub(
        r'<div\s+id=["\']converter-modal["\'][^>]*>[\s\S]*?</div>\s*',
        '',
        content_cleaned,
        count=1
    )

    # 4. Remover comentarios HTML sobre el modal si existen
    content_cleaned = re.sub(
        r'<!-- Converter Modal.*?(?=<|$)',
        '',
        content_cleaned,
        flags=re.IGNORECASE | re.DOTALL
    )

    # Detectar si hubo cambios
    if content_cleaned == content:
        return None  # Sin cambios

    cleaned_size = len(content_cleaned)
    size_diff = original_size - cleaned_size

    # Hacer backup
    backup_path = BACKUP_DIR / filepath.name
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # Guardar versión limpia
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content_cleaned)

    return {
        'file': filepath.name,
        'original_size': original_size,
        'cleaned_size': cleaned_size,
        'bytes_removed': size_diff
    }

def main():
    print("\n" + "="*70)
    print("LIMPIADOR DE CSS INLINE DUPLICADO - Victor IA Blog")
    print("="*70)

    # Encontrar todos los .html en /blog (excepto index.html)
    html_files = sorted([
        f for f in BLOG_DIR.glob("*.html")
        if f.name not in ['index.html', 'blog-premium.html']
    ])

    print(f"\nEncontrados {len(html_files)} archivos para limpiar")
    print(f"Backups guardados en: {BACKUP_DIR}\n")

    cleaned_count = 0
    total_bytes_removed = 0
    cleaned_files = []

    for i, filepath in enumerate(html_files, 1):
        result = clean_html_file(filepath)

        if result:
            cleaned_count += 1
            total_bytes_removed += result['bytes_removed']
            cleaned_files.append(result)

            kb_removed = result['bytes_removed'] / 1024
            print(f"[{i}/{len(html_files)}] OK {filepath.name} ({kb_removed:.1f}KB removidos)")
        else:
            print(f"[{i}/{len(html_files)}] -- {filepath.name} (sin cambios)")

    # Resumen
    print("\n" + "="*70)
    print(f"OK {cleaned_count}/{len(html_files)} archivos limpiados")
    print(f"OK {total_bytes_removed / 1024:.1f}KB de CSS inline removidos")
    print(f"OK Backups guardados en: {BACKUP_DIR}")
    print("="*70 + "\n")

    if cleaned_files:
        print("Detalle de cambios:")
        for f in cleaned_files[:5]:
            print(f"  - {f['file']}: {f['bytes_removed'] / 1024:.1f}KB")
        if len(cleaned_files) > 5:
            print(f"  ... y {len(cleaned_files) - 5} archivos mas")

if __name__ == "__main__":
    main()
