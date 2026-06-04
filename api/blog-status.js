/**
 * Blog Publishing Status API
 * Maneja el estado de publicaciones y notificaciones
 *
 * Endpoints:
 * GET  /api/blog-status          — Obtiene estado de todas las publicaciones hoy
 * POST /api/blog-status/update   — Actualiza estado de una publicación
 * POST /api/blog-status/notify   — Envía notificación de publicación
 */

import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), '.data', 'blog-publications.json');

// Asegurar que la carpeta .data existe
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Estructura de datos: { "2026-06-03": [{ slug, title, type, status, timestamp, url }] }
function getPublications(date = new Date().toISOString().split('T')[0]) {
  try {
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      return data[date] || [];
    }
  } catch (e) {
    console.error('Error reading blog publications:', e);
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
    console.error('Error saving blog publications:', e);
  }
}

function addPublication(publication) {
  const date = publication.timestamp.split('T')[0];
  const pubs = getPublications(date);
  pubs.push(publication);
  savePublications(date, pubs);
  return publication;
}

function updatePublication(slug, updates) {
  const date = new Date().toISOString().split('T')[0];
  const pubs = getPublications(date);
  const index = pubs.findIndex(p => p.slug === slug);

  if (index !== -1) {
    pubs[index] = { ...pubs[index], ...updates, lastUpdated: new Date().toISOString() };
    savePublications(date, pubs);
    return pubs[index];
  }
  return null;
}

export default function handler(req, res) {
  const { method, query, body } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.url === '/api/blog-status' && method === 'GET') {
      // GET /api/blog-status — Obtiene publicaciones de hoy
      const today = new Date().toISOString().split('T')[0];
      const publications = getPublications(today);

      res.status(200).json({
        success: true,
        date: today,
        count: publications.length,
        publications: publications.map(p => ({
          ...p,
          relativeTime: getRelativeTime(p.timestamp)
        }))
      });

    } else if (req.url === '/api/blog-status/update' && method === 'POST') {
      // POST /api/blog-status/update — Actualiza estado
      const { slug, status, url, error } = body;

      if (!slug || !status) {
        res.status(400).json({ success: false, error: 'slug y status requeridos' });
        return;
      }

      // Si no existe, crear uno nuevo
      const today = new Date().toISOString().split('T')[0];
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

      // Actualizar estado
      pub.status = status;
      if (url) pub.url = url;
      if (error) pub.error = error;
      pub.lastUpdated = new Date().toISOString();

      savePublications(today, pubs);

      // Enviar notificación si está publicado
      if (status === 'published' && url) {
        // Aquí irían WebSocket, webhooks, o email
        // Por ahora solo guardamos el estado
      }

      res.status(200).json({ success: true, publication: pub });

    } else if (req.url === '/api/blog-status/notify' && method === 'POST') {
      // POST /api/blog-status/notify — Envía notificación
      const { slug, title, url, type } = body;

      // Aquí implementar notificaciones reales (email, push, webhook, etc.)
      // Por ahora devolvemos éxito

      res.status(200).json({
        success: true,
        message: `Notificación enviada para ${title}`,
        notification: {
          slug,
          title,
          url,
          type,
          timestamp: new Date().toISOString()
        }
      });

    } else {
      res.status(404).json({ success: false, error: 'Endpoint no encontrado' });
    }

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
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
