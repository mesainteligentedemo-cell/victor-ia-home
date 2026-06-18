from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

COVERS_DIR = Path("C:/Users/inbou/victor-ia-home/blog/covers")

ARTICLES = {
    "ia-news-2026-06-01": "IA Today 01/06\nGoogle I/O Gemini",
    "ia-para-restaurantes-mexico": "IA para Restaurantes\nMás Mesas, Menos Desperdicio",
}

def create_cover(slug, title):
    width, height = 1280, 720

    # Fondo: degradado negro a dorado
    img = Image.new('RGB', (width, height), color=(7, 7, 8))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Gradiente
    for y in range(height):
        ratio = y / height
        r = int(7 + (184 - 7) * ratio)
        g = int(7 + (154 - 7) * ratio)
        b = int(8 + (106 - 8) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Patrón visible: X diagonal
    line_color = (184, 154, 106, 80)
    draw.line([(0, 0), (width, height)], fill=line_color, width=3)
    draw.line([(width, 0), (0, height)], fill=line_color, width=3)

    # Bordes
    border_color = (184, 154, 106, 100)
    draw.rectangle([(20, 20), (width-20, height-20)], outline=border_color, width=2)

    # Texto
    try:
        font_big = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 56)
        font_small = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 28)
    except:
        font_big = ImageFont.load_default()
        font_small = font_big

    # Dibujar texto
    lines = title.split('\n')
    y_offset = height // 3

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_big if len(line) < 30 else font_small)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2

        # Sombra
        draw.text((x+3, y_offset+3), line, font=font_big if len(line) < 30 else font_small, fill=(0, 0, 0, 150))
        # Texto
        draw.text((x, y_offset), line, font=font_big if len(line) < 30 else font_small, fill=(234, 230, 223, 255))

        y_offset += 80

    # Guardar
    webp_path = COVERS_DIR / f"{slug}.webp"
    img.save(webp_path, 'WebP', quality=85)
    return f"{slug}: {webp_path.stat().st_size / 1024:.1f}KB"

print("\nRegenerando portadas con contenido visible...\n")
for slug, title in ARTICLES.items():
    result = create_cover(slug, title)
    print(f"OK {result}")

print("\nPortadas regeneradas")
