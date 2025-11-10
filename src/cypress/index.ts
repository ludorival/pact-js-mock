// Export the Pact class from core
export { Pact } from '../core'

// Auto-setup: Importing this module automatically configures Cypress
// This is the recommended way to use pact-js-mock with Cypress
import './setup'

// Export setup utilities for advanced usage
export { pactRegistry } from './registry'
export { setupLifecycleHooks } from './lifecycle'
