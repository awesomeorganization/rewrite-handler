/* eslint-disable node/no-unsupported-features/es-syntax */

// REFERENCES
// https://tools.ietf.org/html/rfc7231#section-7.1.2

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
    if (request.aborted === true || response.writableEnded === true) {
      return
    }
    let statusCode
    for (const rule of compiledRules) {
      if ((rule.method !== undefined && rule.method !== request.method) || (rule.host !== undefined && rule.host !== request.headers.host)) {
        continue
      }
      let isReplaced = false
      if (rule.replacementFunction === undefined) {
        if (rule.pattern.test(request.url) === true) {
          request.url = request.url.replace(rule.pattern, rule.replacement)
          isReplaced = true
        }
      } else {
        const url = rule.replacementFunction(request.url)
        if (url !== undefined) {
          request.url = url
          isReplaced = true
        }
      }
      if (isReplaced === true) {
        statusCode = rule.statusCode
        if (rule.isBreak === true) {
          break
        }
      }
    }
    if (statusCode !== undefined) {
      response
        .writeHead(statusCode, {
          Location: request.url,
        })
        .end()
    }
  }
  const compilePattern = ({ isCaseSensitive, isUnicode, pattern }) => {
    let flags = ''
    if (isCaseSensitive === true) {
      flags += 'i'
    }
    if (isUnicode === true) {
      flags += 'u'
    }
    return new RegExp(pattern, flags)
  }
  const push = ({ host, isBreak = false, isCaseSensitive = false, isUnicode = false, method, pattern, replacement, replacementFunction, statusCode }) => {
    if ((pattern === undefined || replacement === undefined) && replacementFunction === undefined) {
      throw Error('The fields pattern and replacement can not be undefined while replacementFunction one is undefined')
    }
    compiledRules.push({
      host,
      isBreak,
      method,
      pattern:
        pattern === undefined
          ? undefined
          : compilePattern({
              isCaseSensitive,
              isUnicode,
              pattern,
            }),
      replacement,
      replacementFunction,
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
