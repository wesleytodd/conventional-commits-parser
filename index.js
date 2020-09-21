'use strict'
const Scanner = require('./lib/scanner')
const Result = require('./lib/result')
const Token = require('./lib/token')
const lexer = require('./lib/lexer')
const { ParserError, ParseError } = require('./lib/error')
const parser = require('./lib/parser')

module.exports = function (msg, opts) {
  return parser(stateType)(msg)
}
module.exports.Result = Result
module.exports.Token = Token

function * stateType (scan) {
  const type = scan.until(['(', ':', '!', '\n']).trim()

  if (!type) {
    yield new ParseError(scan, `type is required (found type termination "${scan.char || '<end of input>'}")`)
  } else {
    yield new Token('type', type)
  }

  if (scan.char === '!') {
    yield new Token('breaking', true)
    // The first .next consumes the !
    while (scan.next() === ' ') { }
  }

  if (scan.char === '(') {
    yield stateScope
    return
  }

  if (scan.char === ':') {
    if (scan.peek() !== ' ') {
      yield new ParseError(scan, 'a space is required after the colon')
    } else {
      // consume the space
      scan.next()
    }

    yield stateDescription
    return
  }
}

function * stateScope (scan) {
  let scope = scan.until([')', '\n']).trim()

  if (!scope) {
    yield new ParseError(scan, `scope cannot be empty (found scope termination ${scan.char || '<end of file>'})`)
  } else {
    yield new Token('scope', scope)
  }

  // consume the closing paren
  if (scan.char === ')') {
    scan.next()
  }

  if (scan.char === '!') {
    yield new Token('breaking', true)
    scan.next()
  }

  if (scan.char === ':') {
    if (scan.peek() !== ' ') {
      yield new ParseError(scan, 'a space is required after the colon')
    } else {
      // consume the space
      scan.next()
    }

    yield stateDescription
    return
  }
}

function * stateDescription (scan) {
  let description = scan.until(['\n']).trim()

  if (!description) {
    yield new ParseError(scan, `description is required (found description termination ${scan.char === '\n' ? '<new line>' : '<end of file>'})`)
  } else {
    yield new Token('description', description)
  }

  yield stateBody
}

function * stateBody (scan) {
  const lines = []
  let line = scan.until(['\n'])
  while (line !== undefined) {
    if (isFooter(line)) {
      // plus one because we are now on the newline char after
      scan.putBack(line.length + 1)
      break
    } else {
      lines.push(line)
    }
    line = scan.until(['\n'])
  }

  // Ensure we have one leading empty line if we have body content
  if (lines[0] !== '\n' && !lines.filter((l) => !!l.trim()).length) {
    yield new ParseError(scan, 'one blank line is required before body')
  }

  const body = lines.join('')
  if (body) {
    yield new Token('body', body.trim())
  }

  yield stateFooters
}

function * stateFooters (scan) {
  let footer
  let line = scan.until(['\n'])
  while (line !== undefined) {
    const _footer = isFooter(line)
    if (_footer) {
      if (footer) {
        if (footer.token === 'BREAKING CHANGE' || footer.token === 'BREAKING-CHANGE') {
          yield new Token('breaking', true)
        }
        // Trim value
        footer.value = footer.value.trim()
        yield new Token('footers', footer)
      }
      footer = _footer
    } else if (footer) {
      // Append line to previous footer
      footer.raw += line
      footer.value += line
    } else {
      throw ParserError('unexpexted state')
    }

    line = scan.until(['\n'])
  }
  if (footer) {
    if (footer.token === 'BREAKING CHANGE' || footer.token === 'BREAKING-CHANGE') {
      yield new Token('breaking', true)
    }
    // Trim value
    footer.value = footer.value.trim()
    yield new Token('footers', footer)
  }
}

function isFooter (line) {
  const colonSep = line.indexOf(': ')
  const hashSep = line.indexOf(' #')
  if (!line || (colonSep === -1 && hashSep === -1)) {
    return false
  }

  let parts
  let sep
  if (hashSep === -1 || colonSep > hashSep) {
    sep = ': '
  } else {
    sep = ' #'
  }
  parts = line.split(sep)

  // Check token
  const token = parts.shift()
  if (token !== 'BREAKING CHANGE' && token.includes(' ')) {
    return false
  }

  const value = parts.join(sep).trim()
  if (!value) {
    return false
  }

  return {
    raw: line,
    token: token,
    separator: sep,
    value: value
  }
}
