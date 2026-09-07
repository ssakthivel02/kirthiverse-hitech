import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.PORT || 4173)
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
}

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '')
  const resolved = path.resolve(root, clean || 'index.html')
  if (!resolved.startsWith(root)) return null
  return resolved
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return res.end()
  let target = safePath(req.url)
  if (!target) {
    res.writeHead(400)
    return res.end('Bad request')
  }
  try {
    const stat = await fs.stat(target)
    if (stat.isDirectory()) target = path.join(target, 'index.html')
    const body = await fs.readFile(target)
    res.writeHead(200, {
      'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    res.end(body)
  } catch {
    // SPA fallback for deep links such as /lesson/:id and /practice.
    try {
      const body = await fs.readFile(path.join(root, 'index.html'))
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(body)
    } catch {
      res.writeHead(404)
      res.end('Not found')
    }
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`KirthiVerse test server listening on http://127.0.0.1:${port}`)
})
