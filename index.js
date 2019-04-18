const path = require('path')
const qs = require('querystring')
const debug = require('debug')('fetch')

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

    const request = {
      response: true,
      body: opts && opts.body,
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const routename = this.root + path.join('/', url)

    let route = routename + this._parseBody(opts)

    if (opts.method) {
      opts.method = opts.method.toUpperCase()
    }

    if (opts.headers) {
      request.headers = Object.assign({}, request.headers, opts.headers)
    }

    if (opts.body && opts.method === 'POST') {
      opts.body = JSON.stringify(opts.body)
    }

    if (opts.body && opts.method !== 'POST') {
      delete request.body
    }

    let response = null

    try {
      response = await window.fetch(route, request)
    } catch (err) {
      return { err, response: {} }
    }

    response.statusCode = response.status

    let data = {}

    if (response.headers.get('Content-Length') || (opts.method !== 'DELETE')) {
      try {
        data = await response.json()
        try {
          data = JSON.parse(data.body)
        } catch (err) {
          return { err, response: {} }
        }
        debug(`Response from ${route}:`, data || '')
      } catch (err) {
        return { err, response: {} }
      }
    }

    if (!response.ok || response.statusCode >= 300 || response.statusCode < 200) {
      const err = response.statusText || response.message || data.message
      return { data, err, response }
    }

    return { data, response }
  }
}

module.exports = EnhancedFetch
