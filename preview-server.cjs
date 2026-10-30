// Local preview with real HTTP error pages. Run: node preview-server.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.json': 'application/json', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary' };
Object.assign(types, { '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.md': 'text/plain; charset=utf-8' });
const errorPage = (res, status) => {
  fs.readFile(path.join(root, status === 404 ? '404.html' : 'error.html'), (error, bytes) => {
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(error ? 'Página no disponible' : bytes);
  });
};
http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Solicitud inválida'); }
  if (pathname.includes('\0')) { res.writeHead(400); return res.end('Solicitud inválida'); }
  // Static preview must never serve PHP source or SMTP credentials.
  if (/^\/mail(?:\/|$)/i.test(pathname) || /\.php$/i.test(pathname)) return errorPage(res, 404);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || path.relative(root, file).split(path.sep).some(part => part.startsWith('.'))) {
    return errorPage(res, 404);
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return errorPage(res, error && !['ENOENT', 'ENOTDIR'].includes(error.code) ? 500 : 404);
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    let start = 0;
    let end = stat.size - 1;
    let status = 200;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
      if (!range[1]) start = Math.max(0, stat.size - Number(range[2]));
      else { start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2])); }
      if (start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length'] = Math.max(0, end - start + 1);
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || !stat.size) return res.end();
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  });
}).listen(4173, '127.0.0.1', () => console.log('CatapultaPayment: http://127.0.0.1:4173'));
