import { REDIRECT_STATUS_CODES, rewriteHandler } from '../main.js'

import { http } from '@awesomeorganization/servers'
import { strictEqual } from 'assert'
import undici from 'undici'

const data = (body) => {
  return new Promise((resolve) => {
    let chunks = ''
    body.setEncoding('utf8')
    body.on('data', (chunk) => {
      chunks += chunk
    })
    body.once('end', () => {
      resolve(chunks)
    })
  })
}

const test = async () => {
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
    listenOptions: {
      host,
      port,
    },
    onRequest(request, response) {
      handle({
        request,
        response,
      })
      if (response.writableEnded === false) {
        response.end(request.url)
      }
    },
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
    strictEqual(await data(body), '/files/test')
  }
  socket.close()
}

test()
