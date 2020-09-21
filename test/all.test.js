import { REDIRECT_STATUS_CODES, rewriteHandler } from '../main.js'

import { http } from '@awesomeorganization/servers'
import { strictEqual } from 'assert'
import undici from 'undici'

const main = async () => {
  const host = '127.0.0.1'
  const port = 3000
  const { handle, push } = rewriteHandler()
  push({
    pattern: '^/old/(.*)',
    replacement: '/new/$1',
    statusCode: REDIRECT_STATUS_CODES.MOVED_PERMANENTLY,
  })
  push({
    pattern: '^/public/(.*)',
    replacement: '/files/$1',
  })
  const socket = await http({
    host,
    onRequest(request, response) {
      handle({
        request,
        response,
      })
      if (response.writableEnded === false) {
        response.end(request.url)
      }
    },
    port,
  })
  const client = new undici.Client(`http://${host}:${port}`)
  {
    const { headers } = await client.request({
      method: 'GET',
      path: '/old/test',
    })
    strictEqual(headers.location, '/new/test')
  }
  {
    const { body } = await client.request({
      method: 'GET',
      path: '/public/test',
    })
    const chunks = []
    body.on('data', (chunk) => {
      chunks.push(chunk)
    })
    body.on('end', () => {
      strictEqual(Buffer.concat(chunks).toString('utf-8'), '/files/test')
    })
  }
  socket.unref()
}

main()
