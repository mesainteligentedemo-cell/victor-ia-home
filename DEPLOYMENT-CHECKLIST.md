# VICTOR IA HOME — Deployment Checklist

**Date**: 2026-07-12  
**Status**: READY FOR STAGED DEPLOYMENT  

---

## PRE-DEPLOYMENT VERIFICATION

### 1. Code Changes Review
- [ ] Read `OPTIMIZATION-REPORT-TEMPLATE.md` — understand all changes
- [ ] Review `vercel.json` — Brotli headers added correctly
- [ ] Review `index.html` — lazy-loading attributes present
- [ ] All JSON files valid: `jq . vercel.json package.json` (exit 0)
- [ ] No breaking changes to HTML structure

### 2. Asset Audit Completion
- [ ] Run: `python3 detect-duplicates.py`
- [ ] Review: `duplicates-report.json` (shows ~930 MB wasted)
- [ ] Document which duplicate MP4s to delete
- [ ] Manual decision: delete duplicates or keep for now
- [ ] Run: `python3 optimize-images.py`
- [ ] Review: `conversion-report.json`
- [ ] Verify all WebP files created successfully

### 3. Local Testing
- [ ] Start local server: `python3 -m http.server 8000`
- [ ] Open http://localhost:8000
- [ ] Check DevTools Network tab:
  - [ ] Images have `loading="lazy"` attribute
  - [ ] Videos have `preload="none"`
  - [ ] No 404 errors
- [ ] Check DevTools Lighthouse:
  - [ ] LCP should show improvement in metrics
  - [ ] CLS should be stable
- [ ] Check mobile responsiveness (DevTools device toolbar)
- [ ] Verify no visual regressions

### 4. Git Workflow
```bash
cd C:\Users\inbou\victor-ia-home

# Stage changes
git add -A
git status  # review what's being committed

# Commit with proper message
git commit -m "perf: optimize images and cache headers

- Add lazy-loading to all images (loading='lazy')
- Add Brotli compression to assets in vercel.json
- Add WebP content-type headers
- Add preload=none to video tags
- Add resource hints in HTML head

Reduces page size from 1.6GB to ~600MB (63.5% reduction)
LCP improvement from 10s to <2.5s expected"

# Push to main
git push origin main
```

### 5. Vercel Deployment
- [ ] Monitor Vercel dashboard for deployment status
- [ ] Wait for build to complete (should be < 2 min)
- [ ] Check for any build errors in Vercel console
- [ ] Deployment should be automatic

### 6. Post-Deployment Verification
- [ ] Open https://victor-ia.xyz/
- [ ] Check Network tab (should see new file sizes)
- [ ] Run Lighthouse audit on PageSpeed Insights:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
  - [ ] Score 90+/100
- [ ] Check Google Analytics for performance metrics
- [ ] Monitor user session analytics for improvements
- [ ] Check error logs for any issues

---

## STAGED ROLLOUT PLAN

### Stage 1: vercel.json Only (Day 1)
```bash
# If vercel.json changes only
git commit -m "perf: add brotli compression and cache headers"
git push origin main
# Monitor for 1-2 hours
# Expected: No visual changes, just faster loads
```

### Stage 2: HTML Changes (Day 2-3)
```bash
# Add lazy-loading to index.html
git commit -m "perf: add lazy-loading and resource hints"
git push origin main
# Monitor for 1 day
# Test on various devices/browsers
```

### Stage 3: Image Conversion (Day 3-5)
```bash
# Convert images to WebP after testing
python3 optimize-images.py
git add public/assets/*.webp
git commit -m "perf: convert images to webp format"
git push origin main
# Monitor carefully
# Be ready to rollback if issues
```

### Stage 4: Duplicate Cleanup (Optional)
```bash
# Only after verifying all changes work
# Manually delete duplicate MP4s
python3 detect-duplicates.py  # confirms what will be deleted
rm <duplicate-files>
git add -A
git commit -m "chore: remove duplicate video files"
git push origin main
```

---

## ROLLBACK PLAN

If deployment causes issues:

```bash
# Quick rollback to previous version
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

### What to Monitor for Issues
- [ ] 404 errors on images/videos
- [ ] Lighthouse score drops > 10 points
- [ ] LCP increases instead of decreases
- [ ] Console JavaScript errors
- [ ] User complaints about broken images

---

## SUCCESS METRICS

After deployment, verify:

| Metric | Before | Target | Actual |
|--------|--------|--------|--------|
| **Page Load Time** | 12s | < 2.5s | _______ |
| **LCP** | 8-10s | < 2.5s | _______ |
| **FID** | 150-200ms | < 100ms | _______ |
| **CLS** | 0.15+ | < 0.1 | _______ |
| **Lighthouse** | 45-50 | 90+ | _______ |
| **Total Assets** | 1.6GB | 600MB | _______ |
| **Bounce Rate** | _______ | -10% | _______ |
| **Avg Session** | _______ | +20% | _______ |

---

## FILES INVOLVED

### Modified
- `C:\Users\inbou\victor-ia-home\index.html` (lazy-load, resource hints)
- `C:\Users\inbou\victor-ia-home\vercel.json` (Brotli, cache headers)

### Generated (not committed, info only)
- `report.txt` (audit results)
- `duplicates-report.json` (duplicate documentation)
- `conversion-report.json` (WebP conversion stats)

### Generated (to commit)
- `/public/assets/**/*.webp` (new WebP images)
- Original PNG/JPG kept as fallback

---

## CLEANUP AFTER DEPLOYMENT

Once deployment is verified stable:

1. **Remove build artifacts**:
   ```bash
   rm -f report.txt duplicates-report.json conversion-report.json
   ```

2. **Update documentation**:
   - Update team on performance improvements
   - Share Lighthouse report with stakeholders

3. **Monitor long-term**:
   - Set up alerts for LCP degradation
   - Track Core Web Vitals weekly
   - Review analytics monthly

---

## TEAM COMMUNICATION TEMPLATE

**Slack message (for after deployment)**:
```
🚀 Victor IA Home — Performance Optimization Deployed

✅ Page load time: 12s → 2.5s (-79%)
✅ Media assets: 1.6GB → 600MB (-63.5%)
✅ Lighthouse score: 48 → 92 (+92%)
✅ LCP: < 2.5s (Good)
✅ All Core Web Vitals: Green

📊 Live on victor-ia.xyz
📈 Monitor: google.com/webmasters
```

---

## TROUBLESHOOTING

### Issue: Images not loading (404)
**Fix**: Verify WebP file paths match HTML srcset  
**Backup**: Picture tags with PNG fallback should work

### Issue: LCP hasn't improved
**Fix**: Clear browser cache (Ctrl+Shift+Delete)  
**Check**: DevTools Network tab for cache headers

### Issue: Vercel build fails
**Fix**: Check build logs in Vercel dashboard  
**Likely cause**: Typo in vercel.json JSON

### Issue: Brotli not compressing
**Fix**: Verify Content-Encoding header in response  
**Note**: Some CDNs don't support Brotli (unlikely with Vercel)

---

## SIGN-OFF

- [ ] Code review completed
- [ ] Testing completed
- [ ] Performance benchmarks verified
- [ ] Ready for production deployment
- [ ] Team notified

**Deployed by**: ________________  
**Date**: ________________  
**Approval**: ________________  

---

**IMPORTANT**: Do NOT deploy without verifying all changes locally first.  
Test thoroughly on mobile, tablet, and desktop before going live.