'use strict'

module.exports = class Result {
  constructor (opts = {}) {
    this.raw = opts.raw || null
    this.type = opts.type || null
    this.scope = opts.scope || null
    this.description = opts.description || null
    this.body = opts.body || null
    this.footers = opts.footers || null
    this.references = opts.references || null
    this.merge = opts.merge !== undefined ? opts.merge : false
    this.revert = opts.revert !== undefined ? opts.revert : false
    this.breaking = opts.breaking !== undefined ? opts.breaking : false
    this.errors = opts.errors || null
  }
}
