'use strict'
const assert = require('assert')
const parser = require('./index.js')
const { Result } = parser

;[
  {
    message: 'feat: description',
    result: {
      type: 'feat',
      description: 'description'
    }
  },
  {
    message: 'feat (scope): description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description'
    }
  },
  {
    message: 'feat(scope): description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description'
    }
  },
  {
    message: 'feat(scope)!: description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description',
      breaking: true
    }
  },
  {
    message: 'feat (scope)!: description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description',
      breaking: true
    }
  }, {
    message: 'feat!(scope): description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description',
      breaking: true
    }
  },
  {
    message: 'feat !(scope): description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description',
      breaking: true
    }
  },
  {
    message: 'feat! (scope): description',
    result: {
      type: 'feat',
      scope: 'scope',
      description: 'description',
      breaking: true
    }
  },
  {
    message: `feat: description

some body content`,
    result: {
      type: 'feat',
      description: 'description',
      body: 'some body content'
    }
  },
  {
    message: `feat: description

some body content

more body


    `,
    result: {
      type: 'feat',
      description: 'description',
      body: 'some body content\n\nmore body'
    }
  },
  {
    message: `feat: description

some body content

more body

BREAKING CHANGE: some breaking change.
Thanks @stevemao
Reviewed-by: Z
Closes #1`,
    result: {
      type: 'feat',
      description: 'description',
      body: 'some body content\n\nmore body',
      breaking: true,
      footers: [
        {
          raw: 'BREAKING CHANGE: some breaking change.\nThanks @stevemao\n',
          token: 'BREAKING CHANGE',
          separator: ': ',
          value: 'some breaking change.\nThanks @stevemao'
        },
        {
          raw: 'Reviewed-by: Z\n',
          token: 'Reviewed-by',
          separator: ': ',
          value: 'Z'
        },
        {
          raw: 'Closes #1',
          token: 'Closes',
          separator: ' #',
          value: '1'
        },
      ]
    }
  },

  //
  // Error conditions
  //
  {
    message: 'feat:description',
    result: {
      type: 'feat',
      scope: null,
      description: 'description',
      errors: [{
        message: 'Parse error at char 4: a space is required after the colon',
        position: 4,
        character: ':',
        raw: 'feat:description'
      }]
    }
  },
  // {
  //   message: ': description',
  //   result: {
  //     type: null,
  //     description: 'description',
  //     errors: [{
  //       message: 'Parse error at char 0: type is required (found type termination ":")',
  //       position: 0,
  //       character: ':',
  //       raw: ': description'
  //     }]
  //   }
  // },
  // {
  //   message: 'feat: \n',
  //   result: {
  //     type: 'feat',
  //     description: null,
  //     errors: [{
  //       message: 'Parse error at char 6: description is required (found description termination <new line>)',
  //       position: 6,
  //       character: '\n',
  //       raw: 'feat: \n'
  //     }]
  //   }
  // }
].forEach(({ message, result }) => {
  const pr = parser(message)
  const msg = message.replace(/(\r\n|\n|\r)/gm, '\\n')
  try {
    assert.deepStrictEqual({
      raw: pr.raw,
      type: pr.type,
      scope: pr.scope,
      description: pr.description,
      body: pr.body,
      breaking: pr.breaking || false,
      revert: pr.revert || false,
      merge: pr.merge || false,
      footers: pr.footers,
      errors: Array.isArray(pr.errors) ? pr.errors.map((e) => {
        return {
          message: e.message,
          character: e.character,
          position: e.position,
          raw: message
        }
      }) : null
    }, Object.assign({
      raw: message,
      scope: null,
      body: null,
      footers: null,
      revert: false,
      merge: false,
      breaking: false,
      errors: null
    }, result))
    console.log('✓', msg)
  } catch (e) {
    console.error('x', msg)
    console.error(e)
  }
})
