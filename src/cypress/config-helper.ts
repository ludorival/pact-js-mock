import type { CypressConfiguration } from 'cypress'
import pactPlugin from './plugin'

/**
 * Wrapper function to simplify Cypress configuration with Pact plugin
 * 
 * Usage:
 * ```typescript
 * import { defineConfig } from 'cypress'
 * import { withPact } from 'pact-js-mock/lib/cypress'
 * 
 * export default withPact(defineConfig({
 *   component: {
 *     setupNodeEvents(on, config) {
 *       // Your other setup
 *       return config
 *     }
 *   }
 * }))
 * ```
 */
export function withPact<T extends CypressConfiguration>(
  config: T,
): T {
  // Clone to avoid mutating the original
  const configCopy = {
    ...config,
    component: config.component ? { ...config.component } : undefined,
    e2e: config.e2e ? { ...config.e2e } : undefined,
  } as T
  
  // Handle component config
  if (configCopy.component && typeof configCopy.component === 'object') {
    const originalSetupNodeEvents = (configCopy.component as any).setupNodeEvents
    
    ;(configCopy.component as any).setupNodeEvents = (
      on: Cypress.PluginEvents,
      cypressConfig: Cypress.PluginConfigOptions,
    ) => {
      // First apply the pact plugin
      let updatedConfig = pactPlugin(on, cypressConfig)
      
      // Then call the user's setupNodeEvents if it exists
      if (originalSetupNodeEvents) {
        const userResult = originalSetupNodeEvents(on, updatedConfig)
        // If user's function returns a promise, handle it
        if (userResult instanceof Promise) {
          return userResult.then((resolved) => ({ ...updatedConfig, ...resolved }))
        }
        updatedConfig = { ...updatedConfig, ...userResult }
      }
      
      return updatedConfig
    }
  }
  
  // Handle e2e config (similar pattern)
  if (configCopy.e2e && typeof configCopy.e2e === 'object') {
    const originalSetupNodeEvents = (configCopy.e2e as any).setupNodeEvents
    
    ;(configCopy.e2e as any).setupNodeEvents = (
      on: Cypress.PluginEvents,
      cypressConfig: Cypress.PluginConfigOptions,
    ) => {
      let updatedConfig = pactPlugin(on, cypressConfig)
      
      if (originalSetupNodeEvents) {
        const userResult = originalSetupNodeEvents(on, updatedConfig)
        if (userResult instanceof Promise) {
          return userResult.then((resolved) => ({ ...updatedConfig, ...resolved }))
        }
        updatedConfig = { ...updatedConfig, ...userResult }
      }
      
      return updatedConfig
    }
  }
  
  return configCopy
}
