import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? '.output/public')
const port = Number(process.argv[3] ?? process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
}

function resolveRequest(url) {
  const requestPath = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname)
  const normalizedPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, '')
  const absolutePath = resolve(join(root, normalizedPath))

  if (!absolutePath.startsWith(root)) {
    return null
  }

  if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
    return join(absolutePath, 'index.html')
  }

  if (existsSync(absolutePath)) {
    return absolutePath
  }

  return join(root, 'index.html')
}

const server = createServer((request, response) => {
  const filePath = resolveRequest(request.url ?? '/')

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream'
  })
  createReadStream(filePath).pipe(response)
})

server.listen(port, host, () => {
  console.log(`EcoFisher static server: http://${host}:${port}`)
})
