'use strict'

module.exports = class Scanner {
  constructor (msg) {
    this.message = msg
    this.index = -1
    this.char = null
  }

  next (num = 1) {
    let str = ''
    for (let i = 0; i < num; i++) {
     this.index++
     this.char = this.message[this.index]
     if (this.char !== 'undefined') {
      str += this.char
     }
    }
    return str
  }

  until (chars) {
    let str = this.char

    // If we are starting on a matchin characer,
    // consume it and move past
    if (chars.includes(this.char)) {
      this.next()
      return str
    }

    while (!chars.includes(this.next())) {
      if (this.char === undefined) {
        break
      }
      str = str + this.char
    }
    return str
  }

  peek (num = 1) {
    let str = ''
    for (let i = 1; i <= num; i++) {
      const char = this.message[this.index + i]
      if (char !== undefined) {
        str += char
      }
    }
    return str
  }

  putBack (num = 0) {
    this.index = this.index - num
    this.char = this.message[this.index]
  }
}
