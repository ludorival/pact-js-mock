/**
 * Auto-setup for Cypress Pact integration
 *
 * This module automatically:
 * - Registers Cypress commands
 * - Sets up lifecycle hooks for pact management
 * - Provides a simplified API for pact testing
 *
 * Usage:
 *   import 'pact-js-mock/lib/cypress'
 *
 * That's it! No additional configuration needed.
 */

import './commands'
import { setupLifecycleHooks } from './lifecycle'

// Automatically set up lifecycle hooks when this module is imported
setupLifecycleHooks()

// Export registry for advanced usage
export { pactRegistry } from './registry'
