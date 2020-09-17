# rewrite-handler

:boom: [ESM] The rewrite handler for Node.js

---

![npm](https://img.shields.io/david/awesomeorganization/rewrite-handler)
![npm](https://img.shields.io/npm/v/@awesomeorganization/rewrite-handler)
![npm](https://img.shields.io/npm/dt/@awesomeorganization/rewrite-handler)
![npm](https://img.shields.io/npm/l/@awesomeorganization/rewrite-handler)
![npm](https://img.shields.io/bundlephobia/minzip/@awesomeorganization/rewrite-handler)
![npm](https://img.shields.io/bundlephobia/min/@awesomeorganization/rewrite-handler)

---

## Example

```
import { REDIRECT_STATUS_CODES, rewriteHandler } from '@awesomeorganization/rewrite-handler'

import { http } from '@awesomeorganization/servers'

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
```
