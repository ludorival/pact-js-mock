// Auto-setup: Importing this module automatically configures Cypress
// This is the recommended way to use pact-js-mock with Cypress

// Import commands first to ensure TypeScript processes the global type augmentation
import './commands'
import './setup'

// Export setup utilities for advanced usage
export { pactRegistry } from './registry'
export { setupLifecycleHooks } from './lifecycle'
