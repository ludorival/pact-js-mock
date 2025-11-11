I want to convert my existing JavaScript/TypeScript test mocks to generate Pact consumer contracts using pact-js-mock. Please analyze my codebase and apply the appropriate approach based on what you find.

First, please:

1. **Analyze the codebase to determine:**
   - What mocking framework is used? (MSW with `http`/`graphql` handlers, or Cypress with `cy.intercept()`)
   - **If MSW is used**: What version of MSW is installed? (Check package.json for the `msw` dependency version)
   - **If Cypress is used**: What version of Cypress is installed? (Check package.json for the `cypress` dependency version)
   - What testing framework is used? (Jest, Mocha, Vitest, or Cypress)
   - What package manager is used? (npm, yarn, pnpm)
   - What language is used? (JavaScript or TypeScript)
   - What type of API interactions exist? (REST APIs, GraphQL queries/mutations, or both)
   - What external services are called? (infer provider names from URLs or service names)
   - What is the consumer name? (infer from package.json name, project name, or application name)
   - Where are the mock handlers located? (src/mocks, src/handlers, cypress/support, etc.)
   - Where are the tests located? (src/**/\*.test.ts, src/**/\*.spec.ts, cypress/e2e, cypress/component, etc.)
   - Is there an existing pact.config.json file?
   - Is there an existing Cypress configuration file? (cypress.config.ts, cypress.config.js)

2. **Validate project compatibility - STOP IF CONDITIONS NOT MET:**

   **⚠️ CRITICAL: Do NOT proceed with migration if any of the following conditions are not met:**
   - **Language Requirement**: Project MUST be JavaScript or TypeScript (Node.js). If the project uses other languages (Java, Kotlin, Python, etc.), STOP and inform the user that pact-js-mock only works with JavaScript/TypeScript projects.
   - **Mocking Framework Requirement**: Project MUST be using at least one of the following (if NEITHER is found, STOP):
     - **MSW (Mock Service Worker)**: Must have `msw` package installed in package.json and MSW handlers using `http` or `graphql` from 'msw'
     - **Cypress**: Must have `cypress` package installed in package.json and tests using `cy.intercept()`
     - **Note**: Projects using both MSW and Cypress are supported - apply the appropriate setup for each framework
     - **If neither MSW nor Cypress is found**: STOP and inform the user that pact-js-mock requires either MSW or Cypress to be already set up in the project
   - **For MSW projects**:
     - MUST have `msw` installed as a dependency
     - MUST have MSW version compatible with pact-js-mock (pact-js-mock uses MSW ^2.4.11, which requires MSW >= 2.4.11 and < 3.0.0)
     - MUST have existing MSW handlers that import from 'msw'
     - MUST have tests that use MSW handlers (via setupServer or similar)
     - **Version Compatibility Check**: Verify the installed MSW version in package.json is MSW >= 2.4.11 and < 3.0.0. Check the exact version in package.json dependencies. If the project uses MSW v1.x, MSW < 2.4.11, or MSW v3.x+, STOP and inform the user that pact-js-mock requires MSW >= 2.4.11 (MSW v2.x, specifically >= 2.4.11)
     - If MSW is not found or not being used, STOP and inform the user that MSW integration requires an existing MSW setup
   - **For Cypress projects**:
     - MUST have `cypress` installed as a dependency
     - MUST have Cypress version compatible with pact-js-mock (pact-js-mock uses Cypress ^13.15.0, which requires Cypress >= 13.15.0 and < 14.0.0)
     - MUST have Cypress configuration file (cypress.config.ts, cypress.config.js, or cypress/plugins/index.js)
     - MUST have tests using `cy.intercept()` for API mocking
     - **Version Compatibility Check**: Verify the installed Cypress version in package.json is Cypress >= 13.15.0 and < 14.0.0. Check the exact version in package.json dependencies. If the project uses Cypress < 13.15.0, or Cypress v14.x+, STOP and inform the user that pact-js-mock requires Cypress >= 13.15.0 (Cypress v13.x, specifically >= 13.15.0)
     - If Cypress is not found or not being used, STOP and inform the user that Cypress integration requires an existing Cypress setup
   - **Test Files Requirement**: Project MUST have test files that use mocks/intercepts. If no test files with mocks are found, STOP and inform the user that pact-js-mock requires existing mock/intercept usage in tests.

   **If any of the above conditions are not met:**
   - STOP the migration process immediately
   - Inform the user that the project does not meet the requirements for pact-js-mock migration
   - Explain which requirement(s) are missing
   - Do NOT proceed with any code changes or setup steps
   - Suggest alternatives if applicable (e.g., if using a different language, recommend the appropriate Pact library for that language)

3. **Based on your analysis and validation, apply the appropriate setup:**

   ## For MSW (Mock Service Worker) Integration:

   **Step 1: Minimal Setup (Required):**
   - Install `pact-js-mock` as a dev dependency
   - Ensure `msw` is already installed (pact-js-mock works with existing MSW setup)
   - Create `pact.config.json` file in project root with minimal configuration:
     ```json
     {
       "consumerName": "<inferred-consumer-name>",
       "pactVersion": "2.0.0",
       "options": {
         "headersConfig": {
           "includes": ["content-type"]
         }
       }
     }
     ```
   - Infer consumer name from package.json name or project structure
   - This minimal config ensures only `content-type` header is included in pact files (other headers are excluded)

   **Step 2: Baby Steps - Start with ONE handler file:**

   **⚠️ IMPORTANT: Take baby steps. Replace imports in ONE handler file at a time, then test before proceeding.**
   - Find the first MSW handler file that imports from 'msw'
   - Replace MSW imports with pact-js-mock imports in that file:
     - REST: `import { http, HttpResponse } from 'msw'` → `import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'`
     - GraphQL: `import { graphql, HttpResponse } from 'msw'` → `import { pactGraphql as graphql, HttpResponse } from 'pact-js-mock/lib/msw'`
   - **Keep all handler code exactly the same** - the API is identical to MSW, only the import changes
   - **Run tests immediately** to verify handlers still work
   - If tests pass, proceed to replace imports in the next handler file
   - Continue one file at a time, testing after each file
   - **DO NOT** replace all imports at once - do them one file at a time to catch issues early

   **Example MSW Conversion (minimal change):**

   ```typescript
   // Before
   import { http, HttpResponse } from 'msw'
   export const getMovies = http.get('*/movies', () => {
     return HttpResponse.json([{ id: 1, name: 'Movie 1' }])
   })

   // After (step 1 - minimal change: just update the import)
   import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'
   export const getMovies = http.get('*/movies', () => {
     return HttpResponse.json([{ id: 1, name: 'Movie 1' }])
   })
   ```

   **Step 3: Add Lifecycle Hooks (MANDATORY - but can be added after step 2 works):**
   - For Jest/Mocha/Vitest: Add required lifecycle hooks to test files that use MSW handlers:
     - `beforeAll` / `before`: Import and call `deletePacts(pactRegistry)` to clean up existing pact files
     - `beforeEach`:
       - Import and call `setCurrentSourceForPacts(pactRegistry, testName)` to set current test name
       - Import and call `reloadPacts(pactRegistry)` to reload existing pact files
     - `afterEach`: Import and call `writePacts(pactRegistry)` to persist interactions
   - Import required utilities: `deletePacts`, `reloadPacts`, `writePacts`, `setCurrentSourceForPacts` from 'pact-js-mock/lib/utils'
   - Import `pactRegistry` from 'pact-js-mock/lib/msw'
   - Ensure MSW server setup (setupServer) is properly configured
   - Add hooks to ONE test file first, test it, then add to other test files
   - All existing test assertions and logic remain unchanged

   **Step 4: Verify pact generation (after steps 2 and 3):**
   - Run the test that uses the converted handlers
   - Verify the test passes (no regressions)
   - Verify a pact file is generated in `./pacts/` directory (or default location)
   - Verify the pact file contains the interactions
   - Only proceed with more handler files if this works correctly

   **Step 5: Complete the conversion (after verifying step 4 works):**
   - Continue replacing imports in all remaining handler files
   - Still do this one file at a time, testing after each file
   - Add lifecycle hooks to all test files that use MSW handlers
   - Preserve all existing handler logic, response structures, and error handling

   **Step 6: Optional Advanced Configuration (only after basic conversion works):**
   - Update `pact.config.json` file if you need additional configuration beyond the minimal setup from Step 1:
     ```json
     {
       "consumerName": "<custom-consumer-name>",
       "pactVersion": "2.0.0",
       "outputDir": "./pacts",
       "options": {
         "headersConfig": {
           "includes": ["content-type"]
         }
       }
     }
     ```
   - Additional configuration options (optional):
     - Custom consumer name (already set in Step 1, update if needed)
     - Custom pactVersion (2.0.0, 3.0.0, or 4.0.0) - defaults to 2.0.0
     - Custom output directory (defaults to `./pacts`)
     - Additional headers in `headersConfig.includes` array (beyond `content-type`)
     - `basePath` option to strip base path from URLs
   - Optionally add Pact-specific options (description, providerState, providerStates, matchingRules) as third parameter to handlers for enhanced metadata

   ## For Cypress Integration:

   **Step 1: Minimal Setup (Required):**
   - Install `pact-js-mock` as a dev dependency
   - Create `pact.config.json` file in project root with minimal configuration:
     ```json
     {
       "consumerName": "<inferred-consumer-name>",
       "pactVersion": "2.0.0",
       "options": {
         "headersConfig": {
           "includes": ["content-type"]
         }
       }
     }
     ```
   - Infer consumer name from package.json name or project structure
   - This minimal config ensures only `content-type` header is included in pact files (other headers are excluded)
   - Find Cypress support files (cypress/support/component.ts, cypress/support/e2e.ts, or cypress/support/index.ts)
   - Add single import: `import 'pact-js-mock/lib/cypress'`
   - This automatically registers `cy.pactIntercept()` command and lifecycle hooks
   - Update `cypress.config.ts` or `cypress.config.js` to register the Pact plugin (minimal config):
     ```typescript
     import pactPlugin from 'pact-js-mock/lib/cypress/plugin'
     export default defineConfig({
       e2e: {
         setupNodeEvents(on, config) {
           return pactPlugin(on, config)
         },
       },
     })
     ```
   - Ensure TypeScript config includes Cypress files if using TypeScript

   **Step 2: Baby Steps - Start with ONE intercept replacement:**

   **⚠️ IMPORTANT: Take baby steps. Replace ONE `cy.intercept()` at a time, then test before proceeding.**
   - Find the first test file using `cy.intercept()`
   - Replace the FIRST occurrence of `cy.intercept()` with `cy.pactIntercept()` in that file
   - Use the simplest conversion - just change the function name, keep everything else exactly the same:

     ```typescript
     // Before
     cy.intercept('GET', '/api/users', {
       statusCode: 200,
       body: { users: [] },
     }).as('users')

     // After (step 1 - minimal change: just rename the function)
     cy.pactIntercept('GET', '/api/users', {
       statusCode: 200,
       body: { users: [] },
     }).as('users')
     ```

     Or if using simpler format:

     ```typescript
     // Before
     cy.intercept('GET', '/api/users', { users: [] }).as('users')

     // After (step 1 - minimal change: just rename the function)
     cy.pactIntercept('GET', '/api/users', { users: [] }).as('users')
     ```

   - **Run the test immediately** to verify it still works and pact is generated
   - If the test passes, proceed to replace the next `cy.intercept()` in the same file
   - Continue one at a time, testing after each replacement
   - Repeat for all test files, one intercept at a time
   - **DO NOT** replace all intercepts at once - do them one by one to catch issues early

   **Step 3: Verify pact generation (after first replacement):**
   - Run the test that uses `cy.pactIntercept()`
   - Verify the test passes (no regressions)
   - Verify a pact file is generated in `./pacts/` directory (or configured outputDir)
   - Verify the pact file contains the interaction
   - Only proceed with more replacements if this works correctly

   **Step 4: Complete the conversion (after verifying step 3 works):**
   - Continue replacing all remaining `cy.intercept()` calls with `cy.pactIntercept()`
   - Still do this one file at a time, testing after each file
   - Remove any manual pact file management (cy.writePact, cy.reloadPact) - now handled automatically
   - Preserve all existing test logic, assertions, and aliases
   - Provider names are automatically inferred from URLs

   **Step 5: Optional enhancements (only after basic conversion works):**
   - Update `pact.config.json` file if you need additional configuration beyond the minimal setup from Step 1:
     ```json
     {
       "consumerName": "<custom-consumer-name>",
       "pactVersion": "2.0.0",
       "outputDir": "./pacts",
       "options": {
         "basePath": "/api",
         "headersConfig": {
           "includes": ["content-type", "authorization"]
         }
       }
     }
     ```
   - Or add custom plugin configuration in `cypress.config.ts` if needed:
     ```typescript
     return pactPlugin(on, config, {
       consumerName: '<consumer-name>',
       pactVersion: '2.0.0',
       outputDir: './pacts',
       options: {
         basePath: '/api',
         headersConfig: {
           includes: ['content-type', 'authorization'],
         },
       },
     })
     ```
   - Configuration priority: Plugin config → Cypress.env('pact') → pact.config.json
   - Additional configuration options (optional):
     - Additional headers in `headersConfig.includes` array (beyond `content-type` from Step 1)
     - `basePath` option to strip base path from URLs
     - Custom output directory (defaults to `./pacts`)
   - Optionally add `pactOptions` as fourth parameter for enhanced Pact metadata (description, providerState, matchingRules, etc.):
     ```typescript
     cy.pactIntercept(
       'GET',
       '/todo-service/todos',
       [{ id: '1', title: 'Buy milk' }],
       {
         description: 'get all todos',
         providerState: 'todos exist',
       },
     ).as('todos')
     ```
   - Configuration priority: Plugin config → Cypress.env('pact') → pact.config.json

   **Conversion Notes:**
   - The simplest conversion: Just change `cy.intercept` to `cy.pactIntercept`, keep everything else the same
   - Response format options:
     - If using `{ statusCode: 200, body: [...] }`, you can keep it: `cy.pactIntercept('GET', '/api', { statusCode: 200, body: [...] })`
     - Or simplify to just the body: `cy.pactIntercept('GET', '/api', [...])` (statusCode defaults to 200)
     - For the first replacement, keep the exact same format to minimize changes
   - All existing aliases (`.as('alias')`) continue to work unchanged
   - All existing test assertions continue to work unchanged
   - Method, URL, and response parameters work exactly the same as `cy.intercept()`

4. **Execute build and tests to verify migration:**
   - **Run build command** (e.g., `npm run build`, `yarn build`, `pnpm build`) to ensure there are no regressions:
     - Verify the build completes successfully without errors
     - Verify TypeScript compilation succeeds (if TypeScript is used)
     - Verify no breaking changes were introduced
     - If build fails, fix any issues before proceeding
   - **Run tests** (e.g., `npm test`, `yarn test`, `pnpm test`) to verify pact generation:
     - Execute the test suite to ensure all tests pass
     - Verify that existing tests continue to work (no regressions)
     - Verify that pact files are generated in the expected location (typically `./pacts/` directory or configured outputDir)
     - Verify contract files follow naming convention: `<consumer-name>-<provider-name>.json`
     - Verify contracts include all expected interactions from the test runs
     - If tests fail, investigate and fix issues before proceeding
   - **Verify project structure:**
     - Ensure pact files are written to the correct directory (`./pacts` or configured outputDir)
     - Verify that provider names are correctly inferred from URLs (format: `*/provider-name/path`)
   - For Cypress: Verify plugin is properly registered in cypress.config.ts and lifecycle hooks are working
   - For MSW: Verify lifecycle hooks are properly added to all test files using MSW handlers

5. **Set up Pact publishing script:**
   - Install `@pact-foundation/pact-cli` as a dev dependency:
     - For npm: `npm install --save-dev @pact-foundation/pact-cli`
     - For yarn: `yarn add -D @pact-foundation/pact-cli`
     - For pnpm: `pnpm add -D @pact-foundation/pact-cli`
   - Add the `pact:publish` script to package.json:
     ```json
     {
       "scripts": {
         "pact:publish": "pact-broker publish ./pacts --broker-base-url=$PACT_BROKER_BASE_URL --broker-token=$PACT_BROKER_TOKEN --consumer-app-version=$GIT_COMMIT --branch=$GIT_BRANCH"
       }
     }
     ```
   - **Note**: The script uses environment variables that should be set in CI/CD:
     - `PACT_BROKER_BASE_URL`: The URL of your Pact Broker
     - `PACT_BROKER_TOKEN`: Authentication token for Pact Broker (if required)
     - `GIT_COMMIT`: The git commit SHA (used as consumer app version)
     - `GIT_BRANCH`: The git branch name (used to tag contracts with branch name)
   - For local testing on Unix/Linux/macOS, set these environment variables before running the script:
     ```bash
     export PACT_BROKER_BASE_URL=https://your-pact-broker.com
     export PACT_BROKER_TOKEN=your-token
     export GIT_COMMIT=$(git rev-parse HEAD)
     export GIT_BRANCH=$(git branch --show-current)
     npm run pact:publish
     ```
   - **Note**: On Windows, use `set` instead of `export`, or use a cross-platform tool like `cross-env` if needed
   - Verify the script works by running it locally (if Pact Broker is configured) or document that it will be used in CI/CD
   - The script will automatically publish all pact files from the `./pacts` directory to the Pact Broker
   - **Note**: If you have a custom `outputDir` configured in `pact.config.json`, update the script path from `./pacts` to match your configured directory

6. **Analyze and update CI/CD pipeline:**
   - Detect existing CI/CD pipeline (GitHub Actions, Jenkins, GitLab CI, Azure DevOps, CircleCI, etc.)
   - Ask for Pact Broker URL if not found in environment variables or configuration
   - Ask for Pact Broker token if authentication is required
   - Add/modify pipeline steps to:
     - Run tests to generate contracts (npm test, yarn test, etc.)
     - **Publish contracts to Pact Broker after successful tests on ALL branches** (not just main/master):
       - Use the `pact:publish` script created in step 5: `npm run pact:publish` (or `yarn pact:publish`, `pnpm pact:publish`)
       - Contracts should be published for feature branches, pull requests, and main branch
       - This enables contract testing across all branches and helps catch breaking changes early
       - The script automatically uses `--branch` parameter to tag contracts with branch name
     - Optionally add can-i-deploy check before deployment (typically only on main/master or release branches)
   - Ensure proper environment variables are set in the CI/CD pipeline:
     - `PACT_BROKER_BASE_URL`: The URL of your Pact Broker
     - `PACT_BROKER_TOKEN`: Authentication token for Pact Broker (if required)
     - `GIT_COMMIT`: The git commit SHA (usually available as `$GITHUB_SHA`, `$CI_COMMIT_SHA`, etc. in CI/CD)
     - `GIT_BRANCH`: The git branch name (usually available as `$GITHUB_REF_NAME`, `$CI_COMMIT_REF_NAME`, etc. in CI/CD)
   - **Important**: Configure the pipeline to publish contracts on every branch where tests run, not just on merge to main
   - The `pact:publish` script handles all the publishing logic with proper versioning and branch tagging

7. **Suggest a PR description:**
   - Create a comprehensive PR description that includes:
     - **Summary**: Brief overview of the migration to pact-js-mock for generating Pact contracts
     - **What changed**:
       - List all files modified (handler files, test files, configuration files)
       - For MSW: Mention import changes from 'msw' to 'pact-js-mock/lib/msw'
       - For Cypress: Mention replacement of `cy.intercept()` with `cy.pactIntercept()`
       - List any new files created (pact.config.json, lifecycle hooks in test files, etc.)
       - Mention addition of `@pact-foundation/pact-cli` dependency
       - Mention addition of `pact:publish` script in package.json
       - Mention CI/CD pipeline changes if any
     - **How it works**:
       - Pact contracts are generated automatically as a side effect of running tests
       - Contracts are written to `./pacts/` directory (or configured outputDir)
       - Provider names are automatically inferred from URLs
       - All existing tests continue to work unchanged (verified in step 4)
     - **Testing**:
       - All tests pass (no regressions)
       - Pact contracts are generated successfully
       - Contracts include all expected interactions
     - **Next steps** (optional):
       - Set up PACT_BROKER_BASE_URL and PACT_BROKER_TOKEN environment variables in CI/CD
       - Configure Pact Broker publishing in CI/CD using the `pact:publish` script (contracts published on all branches)
       - Test the `pact:publish` script locally if Pact Broker is configured
       - Customize interaction descriptions and provider states if needed
       - Add matching rules for dynamic data (Pact V3/V4) if needed
       - Configure header filtering (includes/excludes) if needed
     - **Breaking changes**: None - all existing tests continue to work
     - **Configuration**: pact.config.json is optional - sensible defaults are used
     - **Documentation**: Link to pact-js-mock README or relevant documentation

8. **Key Points to Remember:**
   - **MSW**: The API is identical to MSW - just change imports. Lifecycle hooks are MANDATORY.
   - **Cypress**: Use `cy.pactIntercept()` instead of `cy.intercept()`. Lifecycle is automatic.
   - **Configuration**: pact.config.json is optional - sensible defaults are used.
   - **Provider Names**: Automatically inferred from URLs (e.g., `*/todo-service/*` → provider: "todo-service")
   - **Zero Boilerplate**: No need to manually create Pact instances or wrap resolvers
   - **Backward Compatible**: All existing test code continues to work unchanged

Please proceed with the analysis and conversion, and ask for clarification if any information is missing or ambiguous.

**Note:** All necessary information for this conversion is provided in this prompt. The instructions are complete and self-contained. Only refer to the project's README.md file if you encounter unexpected issues or need additional context beyond what's provided here.
