import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function resolveRequest(urlText) {
  try {
    const pathname = new URL(urlText, 'http://127.0.0.1').pathname;
    const clean = decodeURIComponent(pathname).replace(/^\/+/, '');
    const resolved = path.resolve(root, clean || 'index.html');
    const withinRoot = resolved === root || resolved.startsWith(root + path.sep);
    return withinRoot ? { pathname, resolved } : null;
  } catch {
    return null;
  }
}

async function sendFile(res, target) {
  const body = await fs.readFile(target);
  res.writeHead(200, {
    'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store, max-age=0',
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    return res.end('Bad request');
  }

  const request = resolveRequest(req.url);
  if (!request) {
    res.writeHead(400);
    return res.end('Bad request');
  }

  let target = request.resolved;
  try {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) target = path.join(target, 'index.html');
    return await sendFile(res, target);
  } catch {
    if (path.extname(request.pathname)) {
      res.writeHead(404, { 'Cache-Control': 'no-store' });
      return res.end('Not found');
    }

    try {
      return await sendFile(res, path.join(root, 'index.html'));
    } catch {
      res.writeHead(404, { 'Cache-Control': 'no-store' });
      return res.end('Not found');
    }
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`KirthiVerse ACTIVE MASTER QA server listening on http://127.0.0.1:${port}`);
});
