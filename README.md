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

Full example in `/example` folder.

```
import { REDIRECT_STATUS_CODES, rewriteHandler } from '@awesomeorganization/rewrite-handler'

import { http } from '@awesomeorganization/servers'
import { staticHandler } from '@awesomeorganization/static-handler'

const main = async () => {
  const rewriteMiddleware = rewriteHandler([
    {
      pattern: '^/old-files/(.*)',
      replacement: '/files/$1',
      statusCode: REDIRECT_STATUS_CODES.MOVED_PERMANENTLY,
    },
    {
      pattern: '(.*)/$',
      replacement: '$1/index.txt',
    },
  ])
  const staticMiddleware = staticHandler({
    directoryPath: './static',
  })
  await http({
    host: '127.0.0.1',
    async onRequest(request, response) {
      rewriteMiddleware.handle({
        request,
        response,
      })
      await staticMiddleware.handle({
        request,
        response,
      })
    },
    port: 3000,
  })
  // TRY
  // http://127.0.0.1:3000/
  // http://127.0.0.1:3000/files/
  // http://127.0.0.1:3000/files/somefile.txt
  // http://127.0.0.1:3000/old-files/
  // http://127.0.0.1:3000/old-files/somefile.txt
}

main()
```
