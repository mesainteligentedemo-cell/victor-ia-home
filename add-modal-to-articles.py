# -*- coding: utf-8 -*-
"""
Add converter modal to all blog articles and map each to correct guide.
Maps each article to the appropriate master guide (9 total).
"""

import json
import os
import re
from pathlib import Path

TOPICS_FILE = r"C:\Users\inbou\victor-ia-marketing\blog-automation\topics.json"
BLOG_DIR = r"C:\Users\inbou\victor-ia-home\blog"

# Mapping: guide slug -> guide title
GUIDES = {
    "ia-hoteles-resorts": "IA para Hoteles & Resorts",
    "ia-restaurantes-bares": "IA para Restaurantes & Bares",
    "ia-agencias-viajes-tours": "IA para Agencias de Viajes & Tours",
    "ia-timeshare-propiedad-fraccionada": "IA para Timeshare & Propiedad Fraccionada",
    "ia-parques-atracciones": "IA para Parques de Atracciones",
    "ia-condominios-rental-vacacional": "IA para Condominios & Rental Vacacional",
    "ia-spas-wellness": "IA para Spas & Wellness",
    "ia-inmobiliarias-constructoras": "IA para Inmobiliarias & Constructoras",
    "ia-logistica-supply-chain-turistico": "IA para Logistica & Supply Chain Turistico"
}

# Keywords mapping for guide selection
INDUSTRY_KEYWORDS = {
    "ia-hoteles-resorts": ["hotel", "resort", "hyatt", "seabird", "hospedaje", "huésped", "check-in"],
    "ia-restaurantes-bares": ["restaurante", "bar", "cocina", "comida", "delivery", "reserva", "mesa"],
    "ia-agencias-viajes-tours": ["viaje", "tour", "turismo", "agencia", "excursión", "paquete", "destino"],
    "ia-timeshare-propiedad-fraccionada": ["timeshare", "fraccionado", "membresía", "propietario", "renovación", "semana"],
    "ia-parques-atracciones": ["parque", "atracción", "entrada", "visitante", "capacidad", "entretenimiento"],
    "ia-condominios-rental-vacacional": ["condominio", "rental", "vacacional", "alquiler", "propiedad", "huésped"],
    "ia-spas-wellness": ["spa", "wellness", "masaje", "belleza", "tratamiento", "relajación"],
    "ia-inmobiliarias-constructoras": ["inmobiliaria", "construcción", "propiedad", "bienes raíces", "comprador", "costa negra"],
    "ia-logistica-supply-chain-turistico": ["logistica", "supply chain", "proveedor", "inventario", "distribución", "entrega"]
}

MODAL_TEMPLATE = """<!-- LEAD MAGNET CONVERTER MODAL -->
<div id="converter-modal" class="converter-modal hidden" data-article-slug="{article_slug}" data-guide-title="{guide_title}" data-guide-name="{guide_slug}">
  <div class="converter-overlay"></div>
  <div class="converter-container">
    <button class="converter-close">&times;</button>
    <div class="converter-content">
      <h3 class="converter-title">PDFix Guia Exclusiva Gratis</h3>
      <p class="converter-subtitle">Descarga la guia sobre {guide_title}</p>
      <form id="converter-form" class="converter-form">
        <div class="form-group">
          <input type="text" id="converter-name" placeholder="Tu nombre" required class="form-input"/>
        </div>
        <div class="form-group">
          <input type="email" id="converter-email" placeholder="Tu email" required class="form-input"/>
        </div>
        <div class="form-group">
          <input type="tel" id="converter-phone" placeholder="Telefono (opcional)" class="form-input"/>
        </div>
        <button type="submit" class="converter-submit">Descargar Guia Ahora</button>
      </form>
      <p class="converter-privacy">
        Protegemos tu privacidad. <a href="/privacy.html">Lee nuestra politica.</a>
      </p>
    </div>
  </div>
</div>

<style>
.converter-modal {{
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; opacity: 1; transition: opacity 0.3s ease;
}}
.converter-modal.hidden {{ display: none; opacity: 0; }}
.converter-overlay {{
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
}}
.converter-container {{
  position: relative; background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px; padding: 40px; width: 90%; max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); animation: slideUp 0.4s ease;
}}
@keyframes slideUp {{
  from {{ opacity: 0; transform: translateY(30px); }}
  to {{ opacity: 1; transform: translateY(0); }}
}}
.converter-close {{
  position: absolute; top: 16px; right: 16px; background: none; border: none;
  font-size: 28px; color: #666; cursor: pointer; padding: 0;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  transition: color 0.2s;
}}
.converter-close:hover {{ color: #000; }}
.converter-content {{ text-align: center; }}
.converter-title {{
  font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;
}}
.converter-subtitle {{
  font-size: 15px; color: #666; margin: 0 0 24px 0;
}}
.converter-form {{
  display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;
}}
.form-group {{ width: 100%; }}
.form-input {{
  width: 100%; padding: 12px 16px; border: 1px solid #ddd;
  border-radius: 8px; font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
}}
.form-input:focus {{
  outline: none; border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}}
.converter-submit {{
  padding: 14px 24px; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; width: 100%;
}}
.converter-submit:hover {{
  transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 102, 255, 0.3);
}}
.converter-submit:disabled {{ opacity: 0.7; cursor: not-allowed; }}
.converter-privacy {{
  font-size: 12px; color: #999; margin: 0;
}}
.converter-privacy a {{ color: #0066ff; text-decoration: none; }}
.converter-privacy a:hover {{ text-decoration: underline; }}
@media (max-width: 600px) {{
  .converter-container {{ padding: 32px 24px; width: 95%; }}
  .converter-title {{ font-size: 20px; }}
}}
</style>"""

def load_topics():
    """Load topics from JSON"""
    with open(TOPICS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('topics', [])

def map_article_to_guide(article_slug, article_title):
    """Map article to most relevant guide"""
    slug_lower = article_slug.lower()
    title_lower = article_title.lower()

    best_match = "ia-hoteles-resorts"  # default
    max_matches = 0

    for guide_slug, keywords in INDUSTRY_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in slug_lower or kw in title_lower)
        if matches > max_matches:
            max_matches = matches
            best_match = guide_slug

    return best_match

def add_modal_to_article(article_slug, guide_slug, guide_title):
    """Add modal to article HTML"""
    article_file = os.path.join(BLOG_DIR, f"{article_slug}.html")

    if not os.path.exists(article_file):
        return False, "not_found"

    # Read article
    with open(article_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if modal already exists
    if 'converter-modal' in content:
        return True, "already_present"

    # Generate modal
    modal_html = MODAL_TEMPLATE.format(
        article_slug=article_slug,
        guide_slug=guide_slug,
        guide_title=guide_title
    )

    # Insert before </body>
    if '</body>' in content:
        content = content.replace('</body>', modal_html + '\n</body>')
    else:
        return False, "no_body_tag"

    # Also add script reference if not present
    if '<script src="/blog/js/converter.js"' not in content:
        script_tag = '<script src="/blog/js/converter.js" defer></script>'
        content = content.replace('</body>', script_tag + '\n</body>')

    # Write back
    with open(article_file, 'w', encoding='utf-8') as f:
        f.write(content)

    return True, "success"

def main():
    print("=" * 80)
    print("ADDING CONVERTER MODALS TO ALL ARTICLES")
    print("=" * 80)
    print()

    topics = load_topics()
    total = len(topics)
    successful = 0
    already_had = 0
    not_found = 0

    for i, topic in enumerate(topics, 1):
        article_slug = topic.get('slug')
        article_title = topic.get('title')

        # Map to guide
        guide_slug = map_article_to_guide(article_slug, article_title)
        guide_title = GUIDES.get(guide_slug, "IA para tu negocio")

        # Add modal
        success, status = add_modal_to_article(article_slug, guide_slug, guide_title)

        if success:
            if status == "success":
                successful += 1
                symbol = "[+]"
            else:
                already_had += 1
                symbol = "[~]"
        else:
            if status == "not_found":
                not_found += 1
            symbol = "[-]"

        # Print progress
        if i % 10 == 0 or i == total:
            print("[" + str(i) + "/" + str(total) + "] " + symbol + " " + article_slug)

    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print("Total articles: " + str(total))
    print("Modals added: " + str(successful))
    print("Already had modal: " + str(already_had))
    print("Article not found: " + str(not_found))
    print()
    print("NEXT STEPS:")
    print("=" * 80)
    print("1. git add blog/*.html")
    print("2. git commit -m 'Add converter modals to all blog articles'")
    print("3. vercel --prod")
    print("4. Configure N8N webhook (see n8n-setup-instructions.md)")
    print("=" * 80)

if __name__ == '__main__':
    main()
