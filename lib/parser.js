'use strict'
const Result = require('./result')
const Token = require('./token')
const lexer = require('./lexer')
const { ParserError, ParseError } = require('./error')

module.exports = function parser (initialState) {
  return (msg) => {
    const lex = lexer(initialState)
    const result = new Result()
    result.raw = msg
    for (const token of lex(msg)) {
      if (token instanceof Error) {
        addError(result, token)
        continue
      }

      // console.log(token)

      // Token indicating end of input
      if (token.type === 'EOF') {
        break
      }
      switch (token.type) {
        case 'type':
        case 'scope':
        case 'description':
        case 'body':
          result[token.type] = token.value
          break
        case 'footers':
        case 'references':
          result[token.type] = result[token.type] || []
          result[token.type].push(token.value)
          break
        case 'merge':
        case 'revert':
        case 'breaking':
          result[token.type] = !!token.value
          break
        default:
          addError(result, new ParserError(`unknown token type: ${token.type}`, result))
      }

    }
    return result
  }
}

function addError (res, err) {
  res.errors = res.errors || []
  res.errors.push(err)
}
