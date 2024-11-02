import { defineConfig } from 'cypress'
import pactPlugin from './src/cypress/plugin'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.tsx',
    setupNodeEvents(on, config) {
      return pactPlugin(on, config)
    },
  },
})
