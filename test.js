import { REDIRECT_STATUS_CODES, rewriteHandler } from './main.js'

import { http } from '@awesomeorganization/servers'

const main = async () => {
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
  await http({
    host: '127.0.0.1',
    onRequest: (request, response) => {
      handle({
        request,
        response,
      })
      if (response.writableEnded === false) {
        response.end(request.url)
      }
    },
    port: 3000,
  })
}

main()
