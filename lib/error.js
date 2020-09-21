'use strict'

module.exports.ParseError = class ParseError extends Error {
  constructor (scan, msg) {
    super(`Parse error at char ${scan.index}: ${msg}`)
    this.position = scan.index
    this.character = scan.char
    this.raw = scan.message
  }
}

module.exports.ParserError = class ParserError extends Error {
  constructor (msg, result) {
    super(`Parser error: ${msg}`)
    Object.assign(this, result)
  }
}
