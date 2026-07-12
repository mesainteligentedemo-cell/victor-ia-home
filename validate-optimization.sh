#!/bin/bash
# VICTOR IA HOME — Optimization Validation Script
# Runs all checks before deployment

set -e

PROJECT_DIR="C:\Users\inbou\victor-ia-home"
cd "$PROJECT_DIR" || exit 1

echo "════════════════════════════════════════════════════════════════════════"
echo "VICTOR IA HOME — OPTIMIZATION VALIDATION"
echo "════════════════════════════════════════════════════════════════════════"

# 1. Validate JSON files
echo -e "\n[1/4] Validating JSON files..."
if command -v jq &> /dev/null; then
    echo "  ✓ vercel.json: $(jq . vercel.json > /dev/null && echo 'VALID' || echo 'INVALID')"
    echo "  ✓ package.json: $(jq . package.json > /dev/null && echo 'VALID' || echo 'INVALID')"
else
    echo "  ⚠ jq not installed, skipping JSON validation"
fi

# 2. Check file counts
echo -e "\n[2/4] Checking asset counts..."
PNG_COUNT=$(find ./public/assets -name "*.png" -type f | wc -l)
JPG_COUNT=$(find ./public/assets -name "*.jpg" -type f | wc -l)
WEBP_COUNT=$(find ./public/assets -name "*.webp" -type f | wc -l)
MP4_COUNT=$(find ./public/assets -name "*.mp4" -type f | wc -l)

echo "  - PNG files: $PNG_COUNT"
echo "  - JPG files: $JPG_COUNT"
echo "  - WebP files: $WEBP_COUNT (should increase after conversion)"
echo "  - MP4 files: $MP4_COUNT"

# 3. Check file sizes
echo -e "\n[3/4] Total asset sizes..."
TOTAL_SIZE=$(du -sh ./public/assets | cut -f1)
PNG_SIZE=$(find ./public/assets -name "*.png" -exec du -b {} + | awk '{sum+=$1} END {printf "%.2f MB\n", sum/1048576}')
JPG_SIZE=$(find ./public/assets -name "*.jpg" -exec du -b {} + | awk '{sum+=$1} END {printf "%.2f MB\n", sum/1048576}')
WEBP_SIZE=$(find ./public/assets -name "*.webp" -exec du -b {} + | awk '{sum+=$1} END {printf "%.2f MB\n", sum/1048576}')

echo "  - Total assets: $TOTAL_SIZE"
echo "  - PNG total: ${PNG_SIZE:-0 MB}"
echo "  - JPG total: ${JPG_SIZE:-0 MB}"
echo "  - WebP total: ${WEBP_SIZE:-0 MB}"

# 4. Verify critical files exist
echo -e "\n[4/4] Verifying critical files..."
FILES=(
    "index.html"
    "vercel.json"
    "package.json"
    "public/assets/frames/hero/f001.jpg"
    "public/assets/higgsfield/hf_20260709_024041_ac060540-4064-46a0-ae7d-5867b5a6d401.png"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo -e "\n════════════════════════════════════════════════════════════════════════"
echo "✓ VALIDATION COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Run: python3 optimize-images.py"
echo "  2. Run: python3 detect-duplicates.py"
echo "  3. Review: duplicates-report.json"
echo "  4. Review: conversion-report.json"
echo "  5. Git commit and push to deploy"
echo ""
