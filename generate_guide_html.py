#!/usr/bin/env python3
"""
Genera guías como HTML (imprimibles a PDF)
"""
from pathlib import Path
from datetime import datetime

GUIDES_DIR = Path("C:/Users/inbou/victor-ia-home/blog/guides")
GUIDES_DIR.mkdir(exist_ok=True)

GUIDES = {
    "ia-para-abogados-despachos-mexico": {
        "title": "Guía Completa: IA para Despachos de Abogados",
        "subtitle": "Automatización Legal sin Perder Control",
        "content": """
<h2>1. INTRODUCCIÓN</h2>
<p>La inteligencia artificial ya no es una herramienta futura para despachos jurídicos. Hoy, los bufetes líderes en México están usando IA para:</p>
<ul>
<li>Revisar expedientes en minutos (vs. horas de trabajo manual)</li>
<li>Automatizar cláusulas estándar en contratos</li>
<li>Clasificar demandas entrantes por prioridad</li>
<li>Atender consultas iniciales 24/7 sin abogado presente</li>
</ul>

<h2>2. CASOS DE USO INMEDIATOS</h2>
<ul>
<li>✓ Gestión de expedientes: OCR + clasificación automática</li>
<li>✓ Redacción de documentos: IA que respeta jurisprudencia mexicana</li>
<li>✓ Análisis de riesgos: Identificación de cláusulas problemáticas</li>
<li>✓ Atención al cliente: Chatbot legal para consultas básicas</li>
</ul>

<h2>3. HERRAMIENTAS RECOMENDADAS</h2>
<ul>
<li>LexisNexis + Claude API para análisis contractual</li>
<li>Document Intelligence para digitalización de expedientes</li>
<li>Caso de uso: Un despacho de 15 abogados ahorró 200 horas/mes</li>
</ul>

<h2>4. PRÓXIMOS PASOS</h2>
<p>Diagnostico de 2 horas sin costo → Piloto en 1 área → Escalada</p>
"""
    },
    "ia-para-restaurantes-mexico": {
        "title": "Guía: IA para Restaurantes Mexicanos",
        "subtitle": "Más Mesas, Menos Desperdicio",
        "content": """
<h2>1. OPTIMIZACIÓN DE RESERVAS</h2>
<p>Sistema de IA que predice cancelaciones: 18% menos mesas vacías</p>
<ul>
<li>Gestión de mesa por duración: maximiza rotación</li>
<li>Recomendaciones de platos según ocupación</li>
</ul>

<h2>2. CONTROL DE INVENTARIO</h2>
<ul>
<li>Predicción automática de demanda por día/hora</li>
<li>Reducción de desperdicios: -22% en promedio</li>
<li>Alertas automáticas cuando falta stock</li>
</ul>

<h2>3. SERVICIO AL CLIENTE</h2>
<ul>
<li>Chatbot bilingüe: responde sobre menú, reservas, horarios</li>
<li>Feedback automático post-compra</li>
<li>Programas de lealtad personalizados</li>
</ul>

<h2>4. RESULTADOS REALES</h2>
<p><strong>Restaurante Tacos El Norte (CDMX):</strong></p>
<ul>
<li>Aumento de cobertura: +12% en mesas</li>
<li>Reducción desperdicios: -18%</li>
<li>Satisfacción cliente: +8%</li>
</ul>
"""
    },
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f9f9f9;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #B89A6A;
            padding-bottom: 20px;
        }}
        .header h1 {{
            color: #B89A6A;
            font-size: 28px;
            margin: 0 0 10px 0;
        }}
        .header p {{
            color: #706C66;
            font-size: 16px;
            margin: 0;
        }}
        .content {{
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        h2 {{
            color: #070708;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid #B89A6A;
            padding-left: 15px;
        }}
        h2:first-child {{
            margin-top: 0;
        }}
        ul {{
            margin: 15px 0;
            padding-left: 30px;
        }}
        li {{
            margin: 10px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 12px;
        }}
        @media print {{
            body {{ background: white; }}
            .content {{ box-shadow: none; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
    </div>

    <div class="content">
        {content}
    </div>

    <div class="footer">
        © 2026 Victor IA | Descargado {date} | victor-ia.xyz
    </div>
</body>
</html>
"""

def create_html_guide(slug, title, subtitle, content):
    """Crea una guía en HTML"""
    html_path = GUIDES_DIR / f"{slug}.html"

    html_content = HTML_TEMPLATE.format(
        title=title,
        subtitle=subtitle,
        content=content,
        date=datetime.now().strftime("%d de %B de %Y")
    )

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    size_kb = html_path.stat().st_size / 1024
    return f"{slug}.html ({size_kb:.1f}KB)"

def main():
    print("\nGENERANDO GUÍAS HTML (imprimibles a PDF)...\n")

    for slug, data in GUIDES.items():
        result = create_html_guide(
            slug,
            data['title'],
            data['subtitle'],
            data['content']
        )
        print(f"OK {result}")

    print(f"\nGuías guardadas en: {GUIDES_DIR}")
    print("Nota: Los usuarios pueden imprimir a PDF desde el navegador (Ctrl+P)")

if __name__ == "__main__":
    main()
