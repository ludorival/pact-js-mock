/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type { Config } from 'jest'
const config: Config = {
  clearMocks: true,
  // Transform .ts, .tsx, .js and .jsx files with ts-jest so we can process ESM
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { tsconfig: 'tsconfig.jest.json', isolatedModules: true },
    ],
  },
  // Allow msw and its ESM dependencies in node_modules to be transformed
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|@open-draft|until-async)/)',
  ],
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
