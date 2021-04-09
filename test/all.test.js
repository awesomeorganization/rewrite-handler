/* eslint-disable node/no-unsupported-features/es-syntax */

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

const test = () => {
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
  push({
    replacementFunction(path) {
      const prefix = '/static/'
      if (path.startsWith(prefix) === true) {
        return `/files/${path.substring(prefix.length)}`
      }
      return undefined
    },
  })
  http({
    listenOptions: {
      host: '127.0.0.1',
      port: 0,
    },
    async onListening() {
      const { address, port } = this.address()
      const client = new undici.Client(`http://${address}:${port}`)
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
      {
        const { body } = await client.request({
          method: 'GET',
          path: '/static/test',
        })
        strictEqual(await data(body), '/files/test')
      }
      await client.close()
      this.close()
    },
    onRequest(request, response) {
      handle({
        request,
        response,
      })
      if (response.writableEnded === true) {
        return
      }
      response.end(request.url)
    },
  })
}

test()
