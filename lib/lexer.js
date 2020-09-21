'use strict'
const { ParserError } = require('./error')
const Scanner = require('./scanner')
const Token = require('./token')

module.exports = function lexer (initialState) {
  return function * (msg) {
    const scan = new Scanner(msg)
    let state = initialState
    while (scan.next()) {
      // Prevents each state function from having to handle EOF
      if (scan.char === undefined) {
        yield new Token('EOF', null)
        break
      }

      // State functions yield tokens, errors and,
      // lastly a function which is the next state
      for (const token of state(scan)) {
        if (token instanceof Token || token instanceof Error) {
          yield token
          continue
        }

        if (typeof token === 'function') {
          state = token
          break
        }

        yield new ParserError(scan, `Invalid state function return value (${typeof token})${token}`)
      }
    }
  }
}
