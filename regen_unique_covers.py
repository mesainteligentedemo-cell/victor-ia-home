from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

COVERS_DIR = Path("C:/Users/inbou/victor-ia-home/blog/covers")

def create_news_cover():
    """IA News - diseño con timeline/líneas de noticias"""
    width, height = 1280, 720
    img = Image.new('RGB', (width, height), color=(7, 7, 8))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Fondo: degradado vertical azul-dorado (tech news vibe)
    for y in range(height):
        ratio = y / height
        r = int(20 + (150 - 20) * ratio)
        g = int(30 + (140 - 30) * ratio)
        b = int(50 + (180 - 50) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Líneas de noticias (timeline vertical)
    line_x = width // 3
    draw.line([(line_x, 50), (line_x, height-50)], fill=(184, 154, 106, 150), width=3)

    # 4 puntos en la línea (noticias)
    for i in range(4):
        y_pos = 150 + (i * 150)
        draw.ellipse([(line_x-15, y_pos-15), (line_x+15, y_pos+15)],
                     fill=(184, 154, 106, 255), outline=(255, 255, 255, 100), width=2)

    # Texto
    try:
        font_title = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 64)
        font_sub = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 32)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title

    text1 = "IA TODAY"
    text2 = "01/06"

    # IA TODAY
    bbox = draw.textbbox((0, 0), text1, font=font_title)
    x = (width - (bbox[2] - bbox[0])) // 2 + 200
    y = height // 2 - 60
    draw.text((x+2, y+2), text1, font=font_title, fill=(0, 0, 0, 150))
    draw.text((x, y), text1, font=font_title, fill=(234, 230, 223, 255))

    # 01/06
    bbox = draw.textbbox((0, 0), text2, font=font_sub)
    x = (width - (bbox[2] - bbox[0])) // 2 + 200
    y = height // 2 + 40
    draw.text((x+2, y+2), text2, font=font_sub, fill=(184, 154, 106, 150))
    draw.text((x, y), text2, font=font_sub, fill=(184, 154, 106, 255))

    webp_path = COVERS_DIR / "ia-news-2026-06-01.webp"
    img.save(webp_path, 'WebP', quality=85)
    return f"ia-news: {webp_path.stat().st_size / 1024:.1f}KB"

def create_restaurant_cover():
    """IA para Restaurantes - diseño con platos/elementos culinarios"""
    width, height = 1280, 720
    img = Image.new('RGB', (width, height), color=(7, 7, 8))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Fondo: degradado naranja-rojo (food/restaurant)
    for y in range(height):
        ratio = y / height
        r = int(120 + (180 - 120) * ratio)
        g = int(40 + (80 - 40) * ratio)
        b = int(10 + (30 - 10) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Elementos decorativos: círculos como platos
    circles = [
        (width * 0.15, height * 0.25, 80),
        (width * 0.75, height * 0.35, 100),
        (width * 0.3, height * 0.75, 90),
        (width * 0.85, height * 0.7, 70),
    ]

    for cx, cy, r in circles:
        # Borde del círculo (plato)
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)],
                     outline=(184, 154, 106, 80), width=3)
        # Centro más oscuro
        draw.ellipse([(cx-r*0.6, cy-r*0.6), (cx+r*0.6, cy+r*0.6)],
                     fill=(0, 0, 0, 60))

    # Texto
    try:
        font_title = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 56)
        font_sub = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 36)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title

    text1 = "IA PARA"
    text2 = "RESTAURANTES"

    # IA PARA
    bbox = draw.textbbox((0, 0), text1, font=font_title)
    x = (width - (bbox[2] - bbox[0])) // 2
    y = height // 2 - 80
    draw.text((x+2, y+2), text1, font=font_title, fill=(0, 0, 0, 150))
    draw.text((x, y), text1, font=font_title, fill=(234, 230, 223, 255))

    # RESTAURANTES
    bbox = draw.textbbox((0, 0), text2, font=font_sub)
    x = (width - (bbox[2] - bbox[0])) // 2
    y = height // 2 + 20
    draw.text((x+2, y+2), text2, font=font_sub, fill=(184, 154, 106, 150))
    draw.text((x, y), text2, font=font_sub, fill=(234, 230, 223, 255))

    webp_path = COVERS_DIR / "ia-para-restaurantes-mexico.webp"
    img.save(webp_path, 'WebP', quality=85)
    return f"restaurantes: {webp_path.stat().st_size / 1024:.1f}KB"

print("\nRegenerando portadas CON DISEÑOS DIFERENTES...\n")
print("OK " + create_news_cover())
print("OK " + create_restaurant_cover())
print("\nPortadas únicas regeneradas")
