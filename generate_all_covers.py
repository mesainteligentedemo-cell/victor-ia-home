#!/usr/bin/env python3
"""
Genera portadas para TODOS los articulos usando Higgsfield
"""
from pathlib import Path
import json

BLOG_DIR = Path("C:/Users/inbou/victor-ia-home/blog")

# Obtener lista de articulos
articles = sorted([f.stem for f in BLOG_DIR.glob("*.html")
    if f.name not in ['index.html', 'blog-premium.html', 'article.html']])

# Generar prompts por artículo
prompts = {}

for slug in articles[:10]:  # Primeros 10
    title = slug.replace('-', ' ').title()
    prompt = f"""Crea una portada profesional para un articulo de blog sobre:
"{title}"

Requisitos:
- Estilo: Minimalista, luxury, moderno
- Colores: Dorados (#B89A6A), negros (#070708), crema (#EAE6DF)
- Composición: Horizontal 16:9, abstracta, sin personas
- Tema: Tecnologia, negocio, profesionalismo
- Calidad: 4K, nítida, HIGH CONTRAST
- Evitar: Texto legible, logos reales
- Asegurar: Imagen VISIBLE, no blanca ni sólida

Genera una imagen hermosa y lista para blog profesional."""
    
    prompts[slug] = prompt

# Imprimir JSON para uso en Higgsfield
print(json.dumps(prompts, indent=2, ensure_ascii=False))
