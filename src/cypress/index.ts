// Export the Pact class
export * from './pact'

// Auto-setup: Importing this module automatically configures Cypress
// This is the recommended way to use pact-js-mock with Cypress
import './setup'

// Export setup utilities for advanced usage
export { pactRegistry } from './registry'
export { setupLifecycleHooks } from './lifecycle'
export { withPact } from './config-helper'
export { default as pactPlugin } from './plugin'
