#!/usr/bin/env python3
"""
Genera PDFs de guías para descarga - usando reportlab
Instalar: pip install reportlab
"""
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime

GUIDES_DIR = Path("C:/Users/inbou/victor-ia-home/blog/guides")
GUIDES_DIR.mkdir(exist_ok=True)

# Guías por artículo
GUIDES = {
    "ia-para-abogados-despachos-mexico": {
        "title": "Guía Completa: IA para Despachos de Abogados",
        "subtitle": "Automatización Legal sin Perder Control",
        "content": """
1. INTRODUCCIÓN
La inteligencia artificial ya no es una herramienta futura para despachos jurídicos. Hoy, los bufetes líderes en México están usando IA para:
- Revisar expedientes en minutos (vs. horas de trabajo manual)
- Automatizar cláusulas estándar en contratos
- Clasificar demandas entrantes por prioridad
- Atender consultas iniciales 24/7 sin abogado presente

2. CASOS DE USO INMEDIATOS
✓ Gestión de expedientes: OCR + clasificación automática
✓ Redacción de documentos: IA que respeta jurisprudencia mexicana
✓ Análisis de riesgos: Identificación de cláusulas problemáticas
✓ Atención al cliente: Chatbot legal para consultas básicas

3. HERRAMIENTAS RECOMENDADAS
- LexisNexis + Claude API para análisis contractual
- Document Intelligence para digitalización de expedientes
- Caso de uso: Un despacho de 15 abogados ahorró 200 horas/mes

4. PRÓXIMOS PASOS
Diagnostico de 2 horas sin costo → Piloto en 1 área → Escalada
"""
    },
    "ia-para-restaurantes-mexico": {
        "title": "Guía: IA para Restaurantes Mexicanos",
        "subtitle": "Más Mesas, Menos Desperdicio",
        "content": """
1. OPTIMIZACIÓN DE RESERVAS
Sistema de IA que predice cancelaciones: 18% menos mesas vacías
Gestión de mesa por duración: maximiza rotación
Recomendaciones de platos según ocupación

2. CONTROL DE INVENTARIO
Predicción automática de demanda por día/hora
Reducción de desperdicios: -22% en promedio
Alertas automáticas cuando falta stock

3. SERVICIO AL CLIENTE
Chatbot bilingüe: responde sobre menú, reservas, horarios
Feedback automático post-compra
Programas de lealtad personalizados

4. RESULTADOS REALES
Restaurante Tacos El Norte (CDMX):
- Aumento de cobertura: +12% en mesas
- Reducción desperdicios: -18%
- Satisfacción cliente: +8%
"""
    },
    "ia-hoteles-mexico": {
        "title": "Guía: Revenue Management con IA",
        "subtitle": "Maximiza ocupación y tarifa promedio",
        "content": """
1. DYNAMIC PRICING
Ajuste automático de tarifas según:
- Demanda predicha (eventos, temporadas)
- Competencia en zona
- Ocupación actual
Resultado: +15-20% en revenue

2. PREDICCIÓN DE NO-SHOW
Identificar reservas de alto riesgo de cancelación
Overbooking inteligente: 2-3% de ventaja
Reduce ingresos perdidos por cancelaciones

3. EXPERIENCIA DEL HUÉSPED
Recomendaciones personalizadas de servicios
Check-in/check-out automatizado
Respuesta inmediata a solicitudes

4. IMPLEMENTACIÓN
Semana 1-2: Integración con PMS
Semana 3-4: Piloto en tarificación
Semana 5+: Escalada completa
"""
    },
}

def create_pdf_guide(slug, title, subtitle, content):
    """Crea un PDF de guía"""
    pdf_path = GUIDES_DIR / f"{slug}.pdf"

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=1*inch,
        bottomMargin=0.75*inch
    )

    styles = getSampleStyleSheet()
    story = []

    # Header
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#B89A6A',
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor='#706C66',
        spaceAfter=20,
        alignment=TA_CENTER
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=16,
        alignment=TA_JUSTIFY,
        textColor='#333333',
        spaceAfter=12
    )

    # Contenido
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(subtitle, subtitle_style))

    # Línea separadora
    story.append(Spacer(1, 0.2*inch))

    # Body
    for paragraph in content.strip().split('\n\n'):
        if paragraph.strip():
            story.append(Paragraph(paragraph.strip(), body_style))
            story.append(Spacer(1, 0.1*inch))

    # Footer
    story.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor='#999999',
        alignment=TA_CENTER
    )
    story.append(Paragraph(
        f"© 2026 Victor IA | Generado {datetime.now().strftime('%d de %B de %Y')} | victor-ia.xyz",
        footer_style
    ))

    # Build PDF
    doc.build(story)
    size_kb = pdf_path.stat().st_size / 1024
    return f"{slug}.pdf ({size_kb:.1f}KB)"

def main():
    print("\nGENERANDO GUÍAS PDF...\n")

    for slug, data in GUIDES.items():
        try:
            result = create_pdf_guide(
                slug,
                data['title'],
                data['subtitle'],
                data['content']
            )
            print(f"✓ {result}")
        except Exception as e:
            print(f"✗ {slug}: {str(e)[:50]}")

    print(f"\nGuías guardadas en: {GUIDES_DIR}")

if __name__ == "__main__":
    main()
