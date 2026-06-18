#!/usr/bin/env python3
"""
Crea placeholders visuales para portadas mientras se generan las reales
Genera imágenes PNG sólidas con texto para que se vea algo
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import textwrap

COVERS_DIR = Path("C:/Users/inbou/victor-ia-home/blog/covers")

ARTICLES = {
    "ia-para-abogados-despachos-mexico": "IA para Abogados",
    "ia-para-restaurantes-mexico": "IA para Restaurantes",
    "ia-news-2026-06-01": "IA Today - 01/06",
}

def create_placeholder(slug, title):
    """Crea una imagen placeholder en WebP"""

    # Crear imagen 1280x720 con colores Victor IA
    width, height = 1280, 720

    # Fondo: degradado de negro a dorado
    img = Image.new('RGB', (width, height), color=(7, 7, 8))  # #070708
    draw = ImageDraw.Draw(img, 'RGBA')

    # Agregar gradiente manual
    for y in range(height):
        # Interpolar de negro a dorado
        ratio = y / height
        r = int(7 + (184 - 7) * ratio)  # 7 -> 184 (#B89A6A)
        g = int(7 + (154 - 7) * ratio)  # 7 -> 154
        b = int(8 + (106 - 8) * ratio)  # 8 -> 106
        draw.line([(0, y), (width, y)], fill=(r, g, b, 200))

    # Agregar texto
    try:
        font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 48)
    except:
        font = ImageFont.load_default()

    # Texto centrado
    text = title
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (width - text_width) // 2
    y = (height - text_height) // 2

    # Sombra
    draw.text((x+2, y+2), text, font=font, fill=(0, 0, 0, 100))
    # Texto
    draw.text((x, y), text, font=font, fill=(234, 230, 223, 255))

    # Guardar como WebP
    webp_path = COVERS_DIR / f"{slug}.webp"
    img.save(webp_path, 'WebP', quality=85)

    return f"{slug}: {webp_path.stat().st_size / 1024:.1f}KB"

def main():
    print("\nCREANDO PLACEHOLDERS DE PORTADAS...\n")

    for slug, title in ARTICLES.items():
        result = create_placeholder(slug, title)
        print(f"OK {result}")

    print("\nPlaceholders creados - ahora se ven las portadas")

if __name__ == "__main__":
    main()
