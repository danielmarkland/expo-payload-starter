import assert from 'node:assert/strict'
import { test } from 'node:test'

import { appendGoogleTagManager } from './google-tag-manager.ts'

function createDom() {
  const scripts = []
  const documentRef = {
    createElement: () => ({}),
    getElementById: (id) => scripts.find((script) => script.id === id) || null,
    head: {
      appendChild: (script) => {
        scripts.push(script)
        return script
      },
    },
  }

  return { documentRef, scripts }
}

test('appends the GTM bootstrap once for a valid container ID', () => {
  const { documentRef, scripts } = createDom()
  const browserWindow = {}

  appendGoogleTagManager('GTM-ABC123', browserWindow, documentRef)
  appendGoogleTagManager('GTM-ABC123', browserWindow, documentRef)

  assert.equal(scripts.length, 1)
  assert.equal(
    scripts[0].src,
    'https://www.googletagmanager.com/gtm.js?id=GTM-ABC123',
  )
  assert.equal(browserWindow.dataLayer.length, 1)
  assert.equal(browserWindow.dataLayer[0].event, 'gtm.js')
  assert.equal(typeof browserWindow.dataLayer[0]['gtm.start'], 'number')
})

test('does not append a script for an invalid or missing container ID', () => {
  const { documentRef, scripts } = createDom()
  const browserWindow = {}

  appendGoogleTagManager('G-ABC123', browserWindow, documentRef)
  appendGoogleTagManager(undefined, browserWindow, documentRef)

  assert.equal(scripts.length, 0)
  assert.equal(browserWindow.dataLayer, undefined)
})
