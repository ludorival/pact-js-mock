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
type SetupNodeEvents =
  | ((
      on: Cypress.PluginEvents,
      cypressConfig: Cypress.PluginConfigOptions,
    ) =>
      | Cypress.PluginConfigOptions
      | void
      | Promise<Cypress.PluginConfigOptions | void>)
  | undefined

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T>)?.then === 'function'
}

function wrapSetupNodeEvents(
  originalSetupNodeEvents: SetupNodeEvents,
): NonNullable<SetupNodeEvents> {
  return (on, cypressConfig) => {
    let updatedConfig = pactPlugin(on, cypressConfig)

    if (originalSetupNodeEvents) {
      const userResult = originalSetupNodeEvents(on, updatedConfig)
      if (userResult && isPromise(userResult)) {
        return userResult.then((resolved) => ({
          ...updatedConfig,
          ...(resolved ?? {}),
        }))
      }
      if (userResult) {
        updatedConfig = { ...updatedConfig, ...userResult }
      }
    }

    return updatedConfig
  }
}

export function withPact<T extends Cypress.ConfigOptions>(config: T): T {
  // Clone to avoid mutating the original
  const configCopy = {
    ...config,
    component: config.component ? { ...config.component } : undefined,
    e2e: config.e2e ? { ...config.e2e } : undefined,
  } as T

  // Handle component config
  if (configCopy.component) {
    configCopy.component.setupNodeEvents = wrapSetupNodeEvents(
      configCopy.component.setupNodeEvents,
    )
  }

  // Handle e2e config (similar pattern)
  if (configCopy.e2e) {
    configCopy.e2e.setupNodeEvents = wrapSetupNodeEvents(
      configCopy.e2e.setupNodeEvents,
    )
  }

  return configCopy
}
