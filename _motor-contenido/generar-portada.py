#!/usr/bin/env python3
"""
Generador de portadas para el blog de Victor IA
Usa OpenRouter -> google/gemini-3.1-flash-image-preview (Nano Banana 2)

USO:
  python generar-portada.py <slug> "<prompt>"
  python generar-portada.py mi-articulo "dark luxury AI scene with gold accents"

El archivo se guarda en:
  C:/Users/inbou/victor-ia-website/img/blog-covers/<slug>.png
"""

import sys
import os
import requests
import base64

OPENROUTER_KEY = "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"
MODEL = "google/gemini-3.1-flash-image-preview"
OUTPUT_DIR = r"C:\Users\inbou\victor-ia-website\img\blog-covers"
PROMPT_SUFFIX = ", dark luxury style, gold accents #B89A6A, deep black background, no text, no faces, ultra detailed, cinematic lighting"


def generar(slug: str, prompt: str) -> str:
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.png")
    if os.path.exists(out_path):
        print(f"SKIP: ya existe {out_path} (elimina para regenerar)")
        return out_path

    full_prompt = prompt if PROMPT_SUFFIX in prompt else prompt + PROMPT_SUFFIX
    print(f"Generando portada '{slug}' via OpenRouter Nano Banana 2...")

    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "HTTP-Referer": "https://victor-ia.xyz",
            "X-Title": "Victor IA Blog",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [{"role": "user", "content": f"Generate an image: {full_prompt}"}],
            "modalities": ["image", "text"],
            "image_config": {"aspect_ratio": "16:9"},
        },
        timeout=120,
    )

    if resp.status_code != 200:
        print(f"ERROR {resp.status_code}: {resp.text[:500]}")
        sys.exit(1)

    data = resp.json()
    # Buscar imagen en la respuesta (formato OpenRouter multimodal)
    img_bytes = None
    img_url = None

    choices = data.get("choices", [])
    if choices:
        msg = choices[0].get("message", {})
        # Formato OpenRouter: images[] en el mensaje
        images = msg.get("images", [])
        if images:
            img_url = images[0].get("image_url", {}).get("url", "")
        else:
            # Fallback: content como lista de bloques o data URL
            content = msg.get("content", "")
            if isinstance(content, list):
                for block in content:
                    if block.get("type") == "image_url":
                        img_url = block.get("image_url", {}).get("url", "")
                        break
            elif isinstance(content, str) and content.startswith("data:image"):
                b64 = content.split(",", 1)[1]
                img_bytes = base64.b64decode(b64)

    if not img_bytes and not img_url:
        print(f"ERROR: no se encontro imagen en la respuesta. Respuesta completa:")
        print(str(data)[:800])
        sys.exit(1)

    if not img_bytes and img_url:
        if img_url.startswith("data:image"):
            b64 = img_url.split(",", 1)[1]
            img_bytes = base64.b64decode(b64)
        else:
            r2 = requests.get(img_url, timeout=60)
            r2.raise_for_status()
            img_bytes = r2.content

    with open(out_path, "wb") as f:
        f.write(img_bytes)

    size_kb = os.path.getsize(out_path) // 1024
    print(f"OK: portada guardada en {out_path} ({size_kb} KB)")
    print(f"  Siguiente: vercel --prod --yes en victor-ia-website, luego victor-ia-home")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("USO: python generar-portada.py <slug> '<prompt>'")
        sys.exit(1)
    generar(sys.argv[1], " ".join(sys.argv[2:]))
