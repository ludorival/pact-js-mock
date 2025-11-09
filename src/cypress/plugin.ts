import { readPact } from '../utils'
import type { PactEnvironmentConfig } from './types'

const checkRead: Record<string, boolean> = {}

function mergePactEnv(
  config: Cypress.PluginConfigOptions,
  pactEnv?: PactEnvironmentConfig,
): Cypress.PluginConfigOptions {
  if (!pactEnv) {
    return config
  }

  const existingEnv = (config.env || {}) as Record<string, unknown>
  const existingPactEnv = (existingEnv.pact ||
    {}) as Partial<PactEnvironmentConfig>

  return {
    ...config,
    env: {
      ...existingEnv,
      pact: {
        ...existingPactEnv,
        ...pactEnv,
      },
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
