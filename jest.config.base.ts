/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type { Config } from 'jest'
const config: Config = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  transform: {
    '\\.(ts)$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 80,
      statements: -10,
    },
  },
  testEnvironment: 'node',
  reporters: [['github-actions', { silent: false }], 'summary'],
}
export default config
