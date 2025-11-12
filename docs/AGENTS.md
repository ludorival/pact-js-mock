# Pact JS Mock - Agent Instructions

This directory contains specialized agent instructions for migrating to pact-js-mock:

- **For MSW (Mock Service Worker) projects**: See [AGENTS_MSW.md](./AGENTS_MSW.md)
- **For Cypress projects**: See [AGENTS_CYPRESS.md](./AGENTS_CYPRESS.md)

## Which file should I use?

- **Use `AGENTS_MSW.md`** if your project uses MSW (Mock Service Worker) for API mocking
- **Use `AGENTS_CYPRESS.md`** if your project uses Cypress with `cy.intercept()` for API mocking
- **If your project uses both MSW and Cypress**: Apply the instructions from both files separately for each framework

Both files contain complete, self-contained instructions for migrating to pact-js-mock with framework-specific guidance.
