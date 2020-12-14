import { STATUS_CODES } from 'http'

export const REDIRECT_STATUS_CODES = {
  FOUND: 302,
  MOVED_PERMANENTLY: 301,
  PERMANENT_REDIRECT: 308,
  SEE_OTHER: 303,
  TEMPORARY_REDIRECT: 307,
}

export const rewriteHandler = ({ rules = [] } = { rules: [] }) => {
  const compiledRules = []

  const handle = ({ request, response }) => {
    let statusCode
    for (const rule of compiledRules) {
      if ((rule.method !== undefined && rule.method !== request.method) || (rule.host !== undefined && rule.host !== request.headers.host)) {
        continue
      }
      if (rule.pattern.test(request.url) === true) {
        request.url = request.url.replace(rule.pattern, rule.replacement)
        statusCode = rule.statusCode
        if (rule.isBreak === true) {
          break
        }
      }
    }
    // If last rule has a statusCode
    if (statusCode !== undefined) {
      response
        .writeHead(statusCode, STATUS_CODES[statusCode], {
          Location: request.url,
        })
        .end()
    }
  }

  const push = ({ host, isBreak = false, isCaseSensitive, isUnicode, method, pattern, replacement, statusCode }) => {
    let flags = ''
    if (isCaseSensitive === true) {
      flags += 'i'
    }
    if (isUnicode === true) {
      flags += 'u'
    }
    compiledRules.push({
      host,
      isBreak,
      method,
      pattern: new RegExp(pattern, flags),
      replacement,
      statusCode,
    })
  }

  for (const rule of rules) {
    push(rule)
  }

  return {
    handle,
    push,
  }
}
