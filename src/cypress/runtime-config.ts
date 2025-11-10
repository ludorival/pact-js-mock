import type {
  Options,
  PactEnvironmentConfig,
  ResolvedPactEnvironment,
  Version,
} from '../types'

function readEnvConfig(): PactEnvironmentConfig {
  if (typeof Cypress === 'undefined' || typeof Cypress.env !== 'function') {
    return {}
  }

  const envConfig = (Cypress.env() || {}) as Record<string, unknown>
  const pactConfig = (envConfig.pact || {}) as Partial<PactEnvironmentConfig>

  return pactConfig
}

export function resolvePactEnvironment(): ResolvedPactEnvironment {
  // Read config from environment
  // Note: The config file (pact.config.json) is read in the plugin (Node.js side)
  // and merged into Cypress.env() before this function is called in the browser
  // The default consumer name and pact version are already applied in the config file reading
  const envConfig = readEnvConfig()

  // Use defaults if not provided in config or env (should already have defaults from config file)
  // Fallback values are kept here as a safety measure in case env config overrides with undefined
  const consumerName = envConfig.consumerName ?? 'my-consumer'
  const pactVersion: Version = envConfig.pactVersion ?? '2.0.0'
  const options = normalizeOptions(envConfig)

  return {
    consumerName,
    pactVersion,
    outputDir: envConfig.outputDir,
    options,
  }
}

function normalizeOptions(config: PactEnvironmentConfig): Options | undefined {
  const envOptions = config.options ?? {}
  const mergedOutputDir = config.outputDir ?? envOptions.outputDir

  if (
    !mergedOutputDir &&
    !envOptions.basePath &&
    !envOptions.headersConfig &&
    envOptions.ignoreConflict === undefined
  ) {
    return Object.keys(envOptions).length ? envOptions : undefined
  }

  return {
    ...envOptions,
    ...(mergedOutputDir ? { outputDir: mergedOutputDir } : {}),
  }
}
