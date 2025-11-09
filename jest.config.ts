/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type { Config } from 'jest'
const config: Config = {
  clearMocks: true,
  // Transform .ts and .tsx files with ts-jest
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // Allow msw sources in node_modules to be transformed (otherwise they're ignored)
  transformIgnorePatterns: ['/node_modules/(?!(msw)/)'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 80,
      statements: -10,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'node',
  reporters: [['github-actions', { silent: false }], 'summary'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
export default config
