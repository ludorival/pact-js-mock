import { existsSync, readFileSync } from 'fs'
import path from 'path'
import type { PactEnvironmentConfig, Version } from '../types'

const DEFAULT_CONSUMER_NAME = 'my-consumer'
const DEFAULT_PACT_SPEC_VERSION: Version = '2.0.0'

/**
 * Reads the pact.config.json file from the project root.
 *
 * @returns The parsed configuration from pact.config.json with defaults applied, or a config with default values if the file doesn't exist or is invalid.
 * @remarks This function is safe to call and will return a config with default values if:
 * - The file doesn't exist
 * - The file cannot be read
 * - The file contains invalid JSON
 * - Any other error occurs during reading
 * The default consumer name ("my-consumer") and pact version ("2.0.0") will be used if not specified in the config file.
 */
export function readPactConfigFile(): PactEnvironmentConfig {
  let fileConfig: PactEnvironmentConfig = {}

  try {
    // Try to find pact.config.json in the project root (where process.cwd() points)
    const configPath = path.resolve(process.cwd(), 'pact.config.json')

    if (existsSync(configPath)) {
      const fileContent = readFileSync(configPath, 'utf-8')
      fileConfig = JSON.parse(fileContent) as PactEnvironmentConfig
    }
  } catch {
    // If file doesn't exist or is invalid, use empty config
    // This makes the config file optional
  }

  // Apply defaults if not present in config file
  return {
    ...fileConfig,
    consumerName: fileConfig.consumerName ?? DEFAULT_CONSUMER_NAME,
    pactVersion: fileConfig.pactVersion ?? DEFAULT_PACT_SPEC_VERSION,
  }
}
