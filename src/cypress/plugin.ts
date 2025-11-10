import { readPactConfigFile } from '../core/config'
import { readPact } from '../utils'
import type { PactEnvironmentConfig } from '../types'

const checkRead: Record<string, boolean> = {}

function mergePactEnv(
  config: Cypress.PluginConfigOptions,
  pactEnv?: PactEnvironmentConfig,
): Cypress.PluginConfigOptions {
  // Read config from file (lowest priority)
  const fileConfig = readPactConfigFile()

  const existingEnv = (config.env || {}) as Record<string, unknown>
  const existingPactEnv = (existingEnv.pact ||
    {}) as Partial<PactEnvironmentConfig>

  // Merge in priority order: file config (lowest) -> existing env (middle) -> provided pactEnv (highest)
  // Start with file config, then merge existing env (existing env takes precedence), then merge provided pactEnv (provided takes precedence)
  const mergedPactEnv: PactEnvironmentConfig = {
    ...fileConfig,
    ...existingPactEnv,
    ...(pactEnv || {}),
    // Merge options with proper priority: file -> existing -> provided
    options:
      fileConfig.options || existingPactEnv.options || pactEnv?.options
        ? {
            ...(fileConfig.options || {}),
            ...(existingPactEnv.options || {}),
            ...(pactEnv?.options || {}),
          }
        : undefined,
  }

  return {
    ...config,
    env: {
      ...existingEnv,
      pact: mergedPactEnv,
    },
  }
}

export default (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  pactEnv?: PactEnvironmentConfig,
) => {
  on('task', {
    readPact(fileName: string) {
      if (!checkRead[fileName]) {
        checkRead[fileName] = true
        return null
      }
      return readPact(fileName)
    },
  })

  return mergePactEnv(config, pactEnv)
}
