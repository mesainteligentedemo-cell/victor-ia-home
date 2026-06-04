/**
 * Blog Publishing Status API
 * GET  /api/blog-status          — Obtiene estado de publicaciones hoy
 * POST /api/blog-status?action=update — Actualiza estado
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'blog-publications.json');

// Asegurar que la carpeta existe
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error('Cannot create .data directory:', e);
  }
}

function getPublications(date) {
  try {
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      return data[date] || [];
    }
  } catch (e) {
    console.error('Error reading:', e);
  }
  return [];
}

function savePublications(date, publications) {
  try {
    let data = {};
    if (fs.existsSync(dataFile)) {
      data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    }
    data[date] = publications;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving:', e);
  }
}

function getRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    if (req.method === 'GET') {
      const publications = getPublications(today);
      return res.status(200).json({
        success: true,
        date: today,
        count: publications.length,
        publications: publications.map(p => ({
          ...p,
          relativeTime: getRelativeTime(p.timestamp)
        }))
      });

    } else if (req.method === 'POST') {
      const { slug, status, url, details } = req.body || {};

      if (!slug || !status) {
        return res.status(400).json({
          success: false,
          error: 'slug y status requeridos'
        });
      }

      const pubs = getPublications(today);
      let pub = pubs.find(p => p.slug === slug);

      if (!pub) {
        pub = {
          slug,
          title: slug.replace(/-/g, ' '),
          type: 'article',
          status: 'initiated',
          timestamp: new Date().toISOString(),
          url: null
        };
        pubs.push(pub);
      }

      pub.status = status;
      if (url) pub.url = url;
      if (details) pub.details = details;
      pub.lastUpdated = new Date().toISOString();

      savePublications(today, pubs);

      return res.status(200).json({
        success: true,
        publication: pub
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
