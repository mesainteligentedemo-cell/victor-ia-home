#!/usr/bin/env python3
"""
Victor IA Home — Duplicate Detection Script
Identifies duplicate MP4 video files and generates a cleanup report
Shows which files can be safely deleted to save space
"""

import os
import json
import hashlib
from pathlib import Path
from collections import defaultdict

ASSETS_PATH = Path("C:/Users/inbou/victor-ia-home/public/assets")
REPORT_PATH = Path("C:/Users/inbou/victor-ia-home/duplicates-report.json")

def get_file_hash(filepath, chunk_size=65536):
    """Calculate SHA256 hash of a file for accurate duplicate detection"""
    hash_obj = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            while chunk := f.read(chunk_size):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    except Exception as e:
        print(f"Error hashing {filepath}: {e}")
        return None

def find_duplicates(directory, extensions):
    """Find all duplicate files by extension"""
    hash_map = defaultdict(list)
    duplicates = {}
    total_size_duplicate = 0

    print(f"\nScanning for {extensions} files in {directory}...")

    for ext in extensions:
        for file_path in directory.rglob(f"*{ext}"):
            file_size = file_path.stat().st_size
            file_hash = get_file_hash(file_path)

            if file_hash:
                hash_map[file_hash].append({
                    'path': str(file_path),
                    'size_mb': round(file_size / (1024 * 1024), 2),
                    'size_bytes': file_size
                })

    # Filter to only include duplicates (more than 1 file with same hash)
    for file_hash, files in hash_map.items():
        if len(files) > 1:
            duplicates[file_hash] = files
            # Calculate savings if we keep only 1 copy
            size_per_file = files[0]['size_bytes']
            copies_to_delete = len(files) - 1
            savings = size_per_file * copies_to_delete
            total_size_duplicate += savings

    return duplicates, total_size_duplicate

def main():
    """Main execution"""
    print("=" * 80)
    print("VICTOR IA HOME — DUPLICATE DETECTION REPORT")
    print("=" * 80)

    if not ASSETS_PATH.exists():
        print(f"✗ Assets directory not found: {ASSETS_PATH}")
        return

    # Find duplicates
    duplicates, total_savings = find_duplicates(ASSETS_PATH, ['.mp4', '.png', '.jpg'])

    # Generate report
    report = {
        "summary": {
            "total_duplicates_found": len(duplicates),
            "total_mb_wasted": round(total_savings / (1024 * 1024), 2),
            "total_bytes_wasted": total_savings
        },
        "duplicates": []
    }

    print(f"\n✓ Found {len(duplicates)} groups of duplicate files\n")

    for idx, (file_hash, files) in enumerate(duplicates.items(), 1):
        size_per_file = files[0]['size_mb']
        copies = len(files)
        total_wasted = size_per_file * (copies - 1)

        print(f"\n[{idx}] DUPLICATE GROUP")
        print(f"    Hash: {file_hash[:16]}...")
        print(f"    Size per file: {size_per_file} MB")
        print(f"    Number of copies: {copies}")
        print(f"    Potential savings: {total_wasted} MB (keep 1, delete {copies-1})")
        print(f"    Files:")

        duplicate_entry = {
            "hash": file_hash,
            "size_mb": size_per_file,
            "copies": copies,
            "potential_savings_mb": total_wasted,
            "files": []
        }

        for file_info in files:
            print(f"      - {file_info['path']}")
            duplicate_entry["files"].append(file_info['path'])

        report["duplicates"].append(duplicate_entry)

    # Save report
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    # Final summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total duplicate groups: {len(duplicates)}")
    print(f"Total wasted space: {total_savings / (1024*1024):.2f} MB")
    print(f"Savings if cleaned: ~{total_savings / (1024*1024*1024):.1f} GB")
    print(f"\nReport saved to: {REPORT_PATH}")
    print("\n⚠️  NOTE: This report ONLY DOCUMENTS duplicates. No files were deleted.")
    print("   Manual review recommended before cleanup.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"✗ Error: {e}")
