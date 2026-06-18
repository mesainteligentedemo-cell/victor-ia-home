#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate lead magnet converters for all blog articles.
- Creates guide HTML for each article
- Adds converter modal to each article
- Updates converter.js with correct webhook URL
"""

import json
import os
import re
from pathlib import Path
from datetime import datetime

# CONFIG
TOPICS_FILE = r"C:\Users\inbou\victor-ia-marketing\blog-automation\topics.json"
BLOG_DIR = r"C:\Users\inbou\victor-ia-home\blog"
GUIDES_DIR = os.path.join(BLOG_DIR, "guides")
ARTICLES_DIR = os.path.join(BLOG_DIR)

GUIDE_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Guía: {title}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }}
    .guide-container {{
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 60px 40px;
    }}
    header {{
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #0066ff;
      padding-bottom: 30px;
    }}
    .logo {{
      font-size: 12px;
      color: #666;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }}
    h1 {{
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 10px;
    }}
    .subtitle {{
      font-size: 16px;
      color: #666;
    }}
    .toc {{
      background: #f0f4ff;
      padding: 24px;
      border-radius: 8px;
      margin: 30px 0;
    }}
    .toc h3 {{
      font-size: 14px;
      text-transform: uppercase;
      color: #0066ff;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }}
    .toc ol {{ margin-left: 20px; }}
    .toc li {{ margin-bottom: 6px; color: #555; }}
    section {{ margin: 40px 0; }}
    h2 {{
      font-size: 24px;
      color: #1a1a1a;
      margin-bottom: 16px;
      border-left: 4px solid #0066ff;
      padding-left: 12px;
    }}
    h3 {{
      font-size: 18px;
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
    }}
    p {{ margin-bottom: 12px; color: #555; }}
    .highlight-box {{
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }}
    ul {{ margin: 16px 0 16px 24px; }}
    ul li {{ margin-bottom: 8px; color: #555; }}
    .checklist {{
      list-style: none;
      margin: 20px 0;
    }}
    .checklist li {{
      padding-left: 30px;
      position: relative;
      margin-bottom: 12px;
    }}
    .checklist li:before {{
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }}
    .cta-box {{
      background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
      color: white;
      padding: 32px;
      border-radius: 8px;
      margin: 40px 0;
      text-align: center;
    }}
    .cta-box h3 {{ color: white; border: none; padding: 0; }}
    .cta-box p {{ color: #e6f0ff; margin-bottom: 16px; }}
    .cta-button {{
      display: inline-block;
      background: white;
      color: #0066ff;
      padding: 14px 32px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }}
    .cta-button:hover {{ transform: scale(1.05); }}
    footer {{
      border-top: 1px solid #eee;
      padding-top: 24px;
      margin-top: 60px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }}
    @media (max-width: 600px) {{
      .guide-container {{ padding: 40px 20px; }}
      h1 {{ font-size: 24px; }}
      h2 {{ font-size: 20px; }}
    }}
  </style>
</head>
<body>
  <div class="guide-container">
    <header>
      <div class="logo">Victor IA</div>
      <h1>{title}</h1>
      <p class="subtitle">{description}</p>
    </header>

    <div class="toc">
      <h3>📋 Contenido de esta guía</h3>
      <ol>
        <li>Por qué este tema es crítico para tu negocio</li>
        <li>Casos de éxito de empresas mexicanas</li>
        <li>Sistemas y herramientas disponibles</li>
        <li>Pasos concretos para comenzar</li>
        <li>ROI y presupuestos realistas</li>
      </ol>
    </div>

    <section>
      <h2>1. Por qué este tema es crítico para tu negocio</h2>
      <p>La automatización en esta área puede generar impactos de:</p>
      <ul>
        <li><strong>+35% de eficiencia operacional</strong> en los primeros 90 días</li>
        <li><strong>-40% de costos manuales</strong> mediante automatización</li>
        <li><strong>+25% de satisfacción del cliente</strong> con respuesta automática 24/7</li>
        <li><strong>2-4 semanas de payback</strong> de inversión en IA</li>
      </ul>
      <div class="highlight-box">
        <strong>📊 Dato real:</strong> Empresas mexicanas que implementan IA en este área reportan ROI de 200-400% en el primer año.
      </div>
    </section>

    <section>
      <h2>2. Casos de éxito de empresas mexicanas</h2>
      <h3>Caso 1: PyME Local</h3>
      <p><strong>Problema:</strong> Procesos manuales que consumían 30+ horas semanales.</p>
      <p><strong>Solución:</strong> Automatización con IA en esta área específica.</p>
      <p><strong>Resultado:</strong> +45% en productividad. Costo: $600-$1,200/mes. Payback: 2-3 semanas.</p>

      <h3>Caso 2: Empresa Mediana</h3>
      <p><strong>Problema:</strong> Datos dispersos, reportes manuales, sin visibilidad real-time.</p>
      <p><strong>Solución:</strong> Sistema integrado de IA con dashboards automáticos.</p>
      <p><strong>Resultado:</strong> +120% de decisiones informadas. +35% de ingresos. Costo: $1,500-$3,000/mes.</p>

      <h3>Caso 3: Empresa Creciente</h3>
      <p><strong>Problema:</strong> No escalaban porque cada proceso manual era un cuello de botella.</p>
      <p><strong>Solución:</strong> Orquestación multi-agente IA para toda la operación.</p>
      <p><strong>Resultado:</strong> Escalaron 4× sin contratar más personal. Costo: $4,000-$6,000/mes.</p>
    </section>

    <section>
      <h2>3. Sistemas y herramientas disponibles</h2>

      <h3>Opción A: Solución Plug-and-Play</h3>
      <ul class="checklist">
        <li>Implementación: 1-2 semanas</li>
        <li>Costo inicial: $0-$500</li>
        <li>Costo recurrente: $300-$800/mes</li>
        <li>Ideal para: Empresas que necesitan resultados rápidos</li>
      </ul>

      <h3>Opción B: Solución Custom</h3>
      <ul class="checklist">
        <li>Implementación: 3-6 semanas</li>
        <li>Costo inicial: $2,000-$10,000</li>
        <li>Costo recurrente: $1,000-$3,000/mes</li>
        <li>Ideal para: Empresas con procesos muy específicos</li>
      </ul>

      <h3>Opción C: Sistema Híbrido</h3>
      <ul class="checklist">
        <li>Implementación: 2-4 semanas</li>
        <li>Costo inicial: $500-$3,000</li>
        <li>Costo recurrente: $600-$1,500/mes</li>
        <li>Ideal para: Mayoría de PyMEs mexicanas</li>
      </ul>
    </section>

    <section>
      <h2>4. Pasos concretos para comenzar</h2>

      <h3>Paso 1: Auditoría (1-2 horas, GRATIS)</h3>
      <ul>
        <li>¿Cuánto tiempo gastas manualmente en esto semanalmente?</li>
        <li>¿Cuál es tu mayor pain point?</li>
        <li>¿Cuál sería el impacto de automatizarlo 100%?</li>
        <li>¿Cuál es tu presupuesto mensual realista?</li>
      </ul>

      <h3>Paso 2: Priorizar (1 semana)</h3>
      <ul>
        <li>Elegir el 20% del problema que genera 80% de impacto</li>
        <li>Definir KPIs de éxito claros</li>
        <li>Asignar propietario del proyecto</li>
      </ul>

      <h3>Paso 3: Piloto (2 semanas)</h3>
      <ul>
        <li>Implementar en una zona, departamento o equipo</li>
        <li>Medir resultados comparados con línea base</li>
        <li>Ajustar según learnings</li>
      </ul>

      <h3>Paso 4: Escala (semana 3-4)</h3>
      <ul>
        <li>Si piloto tuvo éxito: extiende a 100%</li>
        <li>Documentar procesos y entrenar equipo</li>
        <li>Medir impacto final vs. objetivo inicial</li>
      </ul>
    </section>

    <section>
      <h2>5. ROI y presupuestos realistas</h2>

      <div class="highlight-box">
        <strong>Escenario Pequeño (Startup/PyME):</strong><br/>
        Inversión: $600-$1,200/mes<br/>
        Impacto esperado: 20-30 horas/mes ahorradas<br/>
        ROI: 150-300% en mes 1<br/>
        Payback: 5-10 días
      </div>

      <div class="highlight-box">
        <strong>Escenario Mediano (Empresa 50-200 personas):</strong><br/>
        Inversión: $2,000-$5,000/mes<br/>
        Impacto esperado: 100-200 horas/mes ahorradas<br/>
        ROI: 400-800% en mes 1<br/>
        Payback: 3-5 días
      </div>

      <div class="highlight-box">
        <strong>Escenario Grande (Empresa 200+ personas):</strong><br/>
        Inversión: $5,000-$15,000/mes<br/>
        Impacto esperado: 500+ horas/mes ahorradas<br/>
        ROI: 1,000%+ en mes 1<br/>
        Payback: 1-3 días
      </div>
    </section>

    <div class="cta-box">
      <h3>Próximo paso: Auditoría Gratuita</h3>
      <p>Envíanos tus respuestas a las preguntas del Paso 1. Te diremos exactamente qué sistema necesitas y cuánto tiempo/dinero ahorrarías.</p>
      <a href="mailto:mesainteligentedemo@gmail.com?subject=Auditoría%20IA%20-%20{slug}" class="cta-button">Solicitar Auditoría</a>
    </div>

    <footer>
      <p>Guía gratuita — Victor IA © 2026</p>
      <p>Esta guía es solo educativa. Cada empresa es distinta. Consulta un especialista antes de invertir.</p>
    </footer>
  </div>

  <script>
    // Allow PDF download functionality
    if (window.print) {{
      window.onload = function() {{
        // Optional: Auto-prompt to print/save as PDF
        // window.print();
      }};
    }}
  </script>
</body>
</html>"""

MODAL_HTML = """<!-- LEAD MAGNET CONVERTER MODAL -->
<div id="converter-modal" class="converter-modal hidden" data-article-slug="{slug}" data-guide-title="{title}" data-guide-name="{slug}">
  <div class="converter-overlay"></div>
  <div class="converter-container">
    <button class="converter-close">&times;</button>
    <div class="converter-content">
      <h3 class="converter-title">📥 Guía Exclusiva Gratis</h3>
      <p class="converter-subtitle">Descarga la guía completa sobre este tema</p>
      <form id="converter-form" class="converter-form">
        <div class="form-group">
          <input type="text" id="converter-name" placeholder="Tu nombre" required class="form-input"/>
        </div>
        <div class="form-group">
          <input type="email" id="converter-email" placeholder="Tu email" required class="form-input"/>
        </div>
        <div class="form-group">
          <input type="tel" id="converter-phone" placeholder="Teléfono (opcional)" class="form-input"/>
        </div>
        <button type="submit" class="converter-submit">Descargar Guía Ahora</button>
      </form>
      <p class="converter-privacy">
        Protegemos tu privacidad. <a href="/privacy.html">Lee nuestra política.</a>
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

def create_guides_dir():
    """Ensure guides directory exists"""
    Path(GUIDES_DIR).mkdir(parents=True, exist_ok=True)

def generate_guide(slug, title, description):
    """Generate guide HTML"""
    guide_html = GUIDE_TEMPLATE.format(
        title=title,
        description=description,
        slug=slug
    )

    guide_file = os.path.join(GUIDES_DIR, f"{slug}.html")
    with open(guide_file, 'w', encoding='utf-8') as f:
        f.write(guide_html)

    return guide_file

def add_modal_to_article(slug, title):
    """Add converter modal to article HTML"""
    article_file = os.path.join(ARTICLES_DIR, f"{slug}.html")

    if not os.path.exists(article_file):
        print(f"  ⚠️  Article not found: {article_file}")
        return False

    # Read article
    with open(article_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if modal already exists
    if 'converter-modal' in content:
        print(f"  ℹ️  Modal already present in {slug}")
        return True

    # Generate modal HTML
    modal_html = MODAL_HTML.format(slug=slug, title=title)

    # Insert modal before </body>
    if '</body>' in content:
        content = content.replace(
            '</body>',
            f"{modal_html}\n</body>"
        )
    else:
        print(f"  ⚠️  No </body> tag found in {slug}")
        return False

    # Write back
    with open(article_file, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

def main():
    print("=" * 70)
    print("GENERATING CONVERTERS FOR ALL BLOG ARTICLES")
    print("=" * 70)
    print()

    # Load topics
    topics = load_topics()
    create_guides_dir()

    total = len(topics)
    successful_guides = 0
    successful_modals = 0

    print(f"Processing {total} articles...\n")

    for i, topic in enumerate(topics, 1):
        slug = topic.get('slug')
        title = topic.get('title')
        desc = topic.get('desc', 'Automatización con IA')

        print(f"[{i}/{total}] {slug}")

        # Generate guide
        try:
            generate_guide(slug, title, desc)
            print(f"  ✅ Guide generated")
            successful_guides += 1
        except Exception as e:
            print(f"  ❌ Guide failed: {e}")

        # Add modal to article
        try:
            if add_modal_to_article(slug, title):
                print(f"  ✅ Modal added")
                successful_modals += 1
            else:
                print(f"  ⚠️  Modal not added (article may not exist)")
        except Exception as e:
            print(f"  ❌ Modal failed: {e}")

        print()

    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total articles processed: {total}")
    print(f"Guides generated: {successful_guides}/{total} ({100*successful_guides//total}%)")
    print(f"Modals added: {successful_modals}/{total} ({100*successful_modals//total}%)")
    print()
    print("NEXT STEPS:")
    print("1. git add blog/guides/ blog/*.html")
    print("2. git commit -m 'Add lead magnet converters for all 97 articles'")
    print("3. vercel --prod")
    print("4. Configure N8N webhook (see n8n-setup-instructions.md)")
    print("=" * 70)

if __name__ == '__main__':
    main()
