export type HeadersConfig = {
  includes?: string[]
  excludes?: string[]
}
export type HeaderType = Record<string, string | string[]> | undefined

import type { Options, Version } from '../types'

export interface PactEnvironmentConfig {
  consumerName?: string
  pactVersion?: Version
  outputDir?: string
  options?: Options
}

export interface ResolvedPactEnvironment {
  consumerName: string
  pactVersion: Version
  outputDir?: string
  options?: Options
}
