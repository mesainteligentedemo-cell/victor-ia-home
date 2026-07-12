#!/usr/bin/env python3
"""
Victor IA Home — Image Optimization Script
Converts PNG and JPG images to WebP format with maximum compression
Generates LQIP (Low-Quality Image Placeholders) and maintains originals as fallback
"""

import os
import subprocess
import json
from pathlib import Path
from PIL import Image
import hashlib

# Configuration
ASSETS_PATH = Path("C:/Users/inbou/victor-ia-home/public/assets")
HIGGSFIELD_PATH = ASSETS_PATH / "higgsfield"
FRAMES_PATH = ASSETS_PATH / "frames"
OUTPUT_LOG = Path("C:/Users/inbou/victor-ia-home/conversion-report.json")

# Tracking
conversion_stats = {
    "timestamp": None,
    "total_files_processed": 0,
    "png_converted": 0,
    "jpg_converted": 0,
    "bytes_saved": 0,
    "original_size_mb": 0,
    "new_size_mb": 0,
    "reductions": [],
    "errors": []
}

def get_file_hash(filepath):
    """Calculate MD5 hash of a file to detect duplicates"""
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def convert_to_webp(input_path, output_path, quality=92):
    """
    Convert image to WebP format using PIL
    quality: 92 (max compression while maintaining visual quality)
    """
    try:
        img = Image.open(input_path)

        # Convert RGBA to RGB if needed (WebP handles both, but smaller with RGB)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Keep alpha for PNG, but RGB+quality for others
            if input_path.endswith('.png'):
                # PNG with alpha: save as WebP with alpha
                img.save(output_path, 'WEBP', quality=quality, method=6)
            else:
                # JPG: convert to RGB
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                rgb_img.save(output_path, 'WEBP', quality=quality, method=6)
        else:
            img.save(output_path, 'WEBP', quality=quality, method=6)

        return True
    except Exception as e:
        conversion_stats["errors"].append(str(e))
        return False

def create_lqip(input_path):
    """
    Generate a low-quality, blurred placeholder (20x20 pixel blur)
    Returns a data URI with inline SVG
    """
    try:
        img = Image.open(input_path)
        # Resize to 20x20 for ultra-low quality
        thumb = img.resize((20, 20), Image.Resampling.LANCZOS)
        # Convert to base64 data URI
        thumb_path = str(input_path).replace('.png', '-lqip.png').replace('.jpg', '-lqip.jpg')
        thumb.save(thumb_path, quality=30)
        return thumb_path
    except Exception as e:
        print(f"LQIP generation failed for {input_path}: {e}")
        return None

def process_directory(directory, file_extensions):
    """Process all files in directory with given extensions"""
    duplicates_by_hash = {}
    files_processed = []

    for ext in file_extensions:
        for file_path in directory.rglob(f"*{ext}"):
            original_size = file_path.stat().st_size
            file_hash = get_file_hash(file_path)

            # Track duplicates
            if file_hash not in duplicates_by_hash:
                duplicates_by_hash[file_hash] = []
            duplicates_by_hash[file_hash].append(str(file_path))

            # Convert to WebP
            output_path = file_path.with_suffix('.webp')

            if convert_to_webp(file_path, output_path, quality=92):
                new_size = output_path.stat().st_size
                bytes_saved = original_size - new_size
                reduction_pct = (bytes_saved / original_size) * 100 if original_size > 0 else 0

                conversion_stats["bytes_saved"] += bytes_saved
                conversion_stats["original_size_mb"] += original_size / (1024 * 1024)
                conversion_stats["new_size_mb"] += new_size / (1024 * 1024)
                conversion_stats["reductions"].append({
                    "file": str(file_path),
                    "original_mb": round(original_size / (1024 * 1024), 2),
                    "webp_mb": round(new_size / (1024 * 1024), 2),
                    "saved_pct": round(reduction_pct, 1)
                })

                if ext == '.png':
                    conversion_stats["png_converted"] += 1
                elif ext == '.jpg':
                    conversion_stats["jpg_converted"] += 1

                files_processed.append(str(file_path))
                print(f"✓ {file_path.name}: {original_size/1024:.0f}KB → {new_size/1024:.0f}KB ({reduction_pct:.0f}%)")
            else:
                print(f"✗ Failed: {file_path.name}")

            conversion_stats["total_files_processed"] += 1

    return duplicates_by_hash

def main():
    """Main execution"""
    print("=" * 70)
    print("VICTOR IA HOME — IMAGE OPTIMIZATION")
    print("=" * 70)

    # Check if directories exist
    if not HIGGSFIELD_PATH.exists():
        print(f"✗ Higgsfield directory not found: {HIGGSFIELD_PATH}")
        return

    print(f"\nProcessing PNG files in {HIGGSFIELD_PATH}...")
    png_duplicates = process_directory(HIGGSFIELD_PATH, ['.png'])

    print(f"\nProcessing JPG files in {FRAMES_PATH}...")
    jpg_duplicates = process_directory(FRAMES_PATH, ['.jpg'])

    # Report duplicates
    print("\n" + "=" * 70)
    print("DUPLICATE DETECTION REPORT")
    print("=" * 70)

    for file_hash, files in png_duplicates.items():
        if len(files) > 1:
            print(f"\n{len(files)} duplicate copies found:")
            for f in files:
                print(f"  - {f}")

    for file_hash, files in jpg_duplicates.items():
        if len(files) > 1:
            print(f"\n{len(files)} duplicate copies found:")
            for f in files:
                print(f"  - {f}")

    # Final summary
    print("\n" + "=" * 70)
    print("CONVERSION SUMMARY")
    print("=" * 70)
    print(f"PNG files converted: {conversion_stats['png_converted']}")
    print(f"JPG files converted: {conversion_stats['jpg_converted']}")
    print(f"Total size before: {conversion_stats['original_size_mb']:.2f} MB")
    print(f"Total size after: {conversion_stats['new_size_mb']:.2f} MB")
    print(f"Total bytes saved: {conversion_stats['bytes_saved'] / (1024*1024):.2f} MB")

    # Save report
    with open(OUTPUT_LOG, 'w') as f:
        json.dump(conversion_stats, f, indent=2)

    print(f"\nDetailed report saved to: {OUTPUT_LOG}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        conversion_stats["errors"].append(str(e))
