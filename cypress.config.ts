import path from 'path'
import { defineConfig } from 'cypress'
import pactPlugin from './src/cypress/plugin'

const resolveFromRoot = (relativePath: string) =>
  path.resolve(__dirname, relativePath)

export default defineConfig({
  env: {
    pact: {
      consumerName: 'test-consumer',
      pactVersion: '2.0.0',
      options: {
        basePath: '/todo-service',
        headersConfig: {
          includes: ['content-type'],
        },
      },
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        resolve: {
          alias: {
            'pact-js-mock': resolveFromRoot('src/index.ts'),
            'pact-js-mock/lib': resolveFromRoot('src'),
            'pact-js-mock/lib/cypress': resolveFromRoot('src/cypress'),
            'pact-js-mock/lib/cypress/index': resolveFromRoot(
              'src/cypress/index.ts',
            ),
            'pact-js-mock/lib/cypress/setup': resolveFromRoot(
              'src/cypress/setup.ts',
            ),
            'pact-js-mock/lib/cypress/node': resolveFromRoot(
              'src/cypress/node.ts',
            ),
            'pact-js-mock/lib/cypress/plugin': resolveFromRoot(
              'src/cypress/plugin.ts',
            ),
          },
        },
      },
    },
    specPattern: 'src/**/*.cy.tsx',
    setupNodeEvents(on, config) {
      return pactPlugin(on, config)
    },
  },
})
