/// <reference lib="dom" />

import '@testing-library/jest-dom/vitest'
import { afterEach} from 'bun:test'
import { cleanup } from '@testing-library/react'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { configure } from '@testing-library/react'

// Initialize happy-dom
GlobalRegistrator.register()

// Configure testing library
configure({
    testIdAttribute: 'data-testid',
})

// Cleanup after each test
afterEach(() => {
    cleanup()
    // Reset the document body after each test
    document.body.innerHTML = ''
}) 