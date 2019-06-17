const path = require('path')
const qs = require('querystring')
const debug = require('debug')('enhanced-fetch')

class EnhancedFetch {
  constructor (opts = {}) {
    this.root = opts.root || null
  }

  _parseBody (opts) {
    //
    // Handle case where user actually wants a query string.
    //
    if (opts.body && opts.method !== 'POST') {
      return '?' + qs.stringify(opts.body)
    }

    return ''
  }

  async request (url, opts = {}) {
    if (!this.root) {
      return { err: `No root set.` }
    }

    if (!navigator.onLine) {
      return { err: `No network connection detected; unable to fetch ${url}` }
    }

    // debug(`opts`, opts)

    const request = {
      response: true,
      body: opts && opts.body,
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (opts.headers) {
      request.headers = Object.assign({}, request.headers, opts.headers)
    }

    // debug(`request`)
    // debug(request)

    const routename = this.root + path.join('/', url)

    let route = routename + this._parseBody(request)

    request.method = request.method.toUpperCase()

    if (request.body && request.method === 'POST') {
      debug(`stringifying body for POST`)
      request.body = JSON.stringify(request.body)
    }

    if (request.body && request.method == 'GET') {
      debug(`deleting body for GET`)
      delete request.body
    }

    let response = null

    debug(`route`, route)
    // debug(`request transformed:`)
    // debug(request)

    try {
      response = await window.fetch(route, request)
    } catch (err) {
      return { err, response: {} }
    }

    response.statusCode = response.status

    debug(`response.statusCode`, response.statusCode)

    let data = {}

    if (!response.ok || response.statusCode >= 300 || response.statusCode < 200) {
      const err = response.statusText || response.message || data.message
      return { err, response }
    }

    if (response.headers.get('Content-Length') || (request.method !== 'DELETE')) {
      try {
        data = await response.json()
        debug(`Response from ${route}:`, data || '')
      } catch (err) {
        return { err, response: {} }
      }
    }

    return { data, response }
  }
}

module.exports = EnhancedFetch
