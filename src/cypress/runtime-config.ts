import packageJson from '../../package.json'
import type { Options, Version } from '../types'
import type { PactEnvironmentConfig, ResolvedPactEnvironment } from './types'

const DEFAULT_PACT_SPEC_VERSION: Version = '2.0.0'

function readEnvConfig(): PactEnvironmentConfig {
  if (typeof Cypress === 'undefined' || typeof Cypress.env !== 'function') {
    return {}
  }

  const envConfig = (Cypress.env() || {}) as Record<string, unknown>
  const pactConfig = (envConfig.pact || {}) as Partial<PactEnvironmentConfig>

  return pactConfig
}

export function resolvePactEnvironment(): ResolvedPactEnvironment {
  const pactEnv = readEnvConfig()
  const consumerName = pactEnv.consumerName ?? packageJson.name
  const pactVersion = pactEnv.pactVersion ?? DEFAULT_PACT_SPEC_VERSION
  const options = normalizeOptions(pactEnv)

  return {
    consumerName,
    pactVersion,
    outputDir: pactEnv.outputDir,
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
