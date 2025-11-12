Convert existing Cypress test mocks using `cy.intercept()` to generate Pact consumer contracts with pact-js-mock.

## 1. Analyze Codebase

Determine:

- Cypress version (check package.json for `cypress` dependency, must be >= 13.15.0 and < 14.0.0)
- Package manager (npm, yarn, pnpm)
- Language (JavaScript or TypeScript)
- Test locations (cypress/e2e, cypress/component, etc.)
- Consumer name (infer from package.json name or project structure)
- Provider names (infer from URLs or service names)
- Existing pact.config.json or cypress.config.ts/js files

## 2. Validate Compatibility - STOP IF NOT MET

**⚠️ CRITICAL: Do NOT proceed if conditions are not met:**

- **Language**: MUST be JavaScript or TypeScript (Node.js). STOP if other languages.
- **Cypress**: MUST have:
  - `cypress` package installed
  - Cypress version >= 13.15.0 and < 14.0.0 (verify in package.json)
  - Cypress config file (cypress.config.ts, cypress.config.js, or cypress/plugins/index.js)
  - Tests using `cy.intercept()` for API mocking
- **Test Files**: MUST have test files using `cy.intercept()`. STOP if none found.

**If conditions not met:**

- STOP immediately
- Inform user which requirements are missing
- Do NOT proceed with code changes

## 3. Determine Migration Scope - MANDATORY BEFORE PROCEEDING

**⚠️ MANDATORY: You MUST ask the user to decide migration scope before starting. Do NOT proceed to section 4 until the user has decided.**

**Ask the user to decide migration scope:**

- **Migrate all mocks**: Convert all `cy.intercept()` calls to `cy.pactIntercept()` across all test files
  - Recommended for new projects or when ready to fully adopt Pact
  - Simplifies contract management with complete coverage
- **Migrate subset of mocks**: Convert only specific `cy.intercept()` calls
  - Recommended for gradual migration or when only certain APIs need contracts
  - Identify which intercepts to migrate based on:
    - Critical API endpoints
    - External service dependencies
    - APIs that change frequently
    - Provider services that need contract testing

**If migrating a subset:**

- Identify test files containing the intercepts to migrate
- List the specific endpoints/URLs to convert
- Document which intercepts will remain as `cy.intercept()` (not converted)
- Plan to migrate remaining intercepts in future iterations

**⚠️ CRITICAL:**

- **STOP** and wait for user's decision on migration scope
- **Do NOT proceed** to section 4 (Setup and Conversion) until the user has explicitly decided
- Once the user confirms the migration scope, document it and then proceed to section 4

## 4. Setup and Conversion

### Step 1: Minimal Setup

- Install: `npm install --save-dev pact-js-mock` (or yarn/pnpm equivalent)
- Create `pact.config.json`:
  ```json
  {
    "consumerName": "<inferred-consumer-name>",
    "pactVersion": "3.0.0",
    "options": {
      "headersConfig": {
        "includes": ["content-type"]
      }
    }
  }
  ```
- Add to Cypress support file (cypress/support/component.ts, e2e.ts, or index.ts):
  ```typescript
  import 'pact-js-mock/lib/cypress'
  ```
- Update `cypress.config.ts`:
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

### Step 2: Replace Intercepts and Complete Conversion

- Find test files with `cy.intercept()` (within migration scope determined in section 3)
- Replace `cy.intercept()` with `cy.pactIntercept()` (keep everything else identical)

**Examples:**

**Conversion examples (always include provider states):**

```typescript
// Before
cy.intercept('GET', '/api/users', { users: [] }).as('users')

// After - always add providerStates for better contract clarity
// description is optional - will use test title by default if not provided
cy.pactIntercept(
  'GET',
  '/api/users',
  { users: [] },
  {
    providerStates: 'users service is available', // Reusable state
    // description: 'get users list', // Optional - defaults to test title
  },
).as('users')
```

**Conversion with parameters (for reusability):**

```typescript
// Before
cy.intercept('GET', '/todo-service/todos/:id', {
  id: '1',
  title: 'Buy milk',
}).as('todo')

// After - use parameters for reusable states
// description is optional - will use test title by default
cy.pactIntercept(
  'GET',
  '/todo-service/todos/:id',
  { id: '1', title: 'Buy milk' },
  {
    providerStates: [
      {
        name: 'todo exists', // Reusable state name
        params: { id: '1' }, // Parameters enable reusability with different values
      },
    ],
    // description: 'get todo by id', // Optional - defaults to test title
  },
).as('todo')

// Same state can be reused with different parameters
cy.pactIntercept(
  'GET',
  '/todo-service/todos/:id',
  { id: '2', title: 'Complete project' },
  {
    providerStates: [
      {
        name: 'todo exists', // Same state name - reusable
        params: { id: '2' }, // Different parameter value
      },
    ],
    // description: 'get todo by id', // Optional - defaults to test title
  },
).as('todo2')
```

**Conversion with provider states (for error scenarios):**

```typescript
// Before
cy.intercept('GET', '/todo-service/todos/:id', {
  statusCode: 404,
  body: { error: 'Todo not found' },
}).as('todoNotFound')

// After - add providerStates for error scenarios
// description is optional - will use test title by default
cy.pactIntercept(
  'GET',
  '/todo-service/todos/:id',
  {
    statusCode: 404,
    body: { error: 'Todo not found' },
  },
  {
    providerStates: [
      {
        name: 'todo does not exist', // Reusable error state
        params: { id: '999' }, // Parameters specify which todo doesn't exist
      },
    ],
    // description: 'get todo by id returns not found', // Optional - defaults to test title
  },
).as('todoNotFound')
```

**Provider States Guidelines (Pact V3):**

- **Always use provider states**: Add provider states to all interactions for better contract clarity and provider testability
  - Success scenarios: Describe the state needed for the interaction (e.g., "todo exists", "user is authenticated", "order is pending")
  - Error scenarios: Describe the state that leads to the error (e.g., "todo does not exist", "user is not authorized", "order not found")
  - Service availability: Use generic states for service-level setup (e.g., "users service is available", "todo service is available")
- **Reusability through parameters**:
  - Use the same state name with different parameters to avoid state multiplication
  - Example: Use `{ name: 'todo exists', params: { id: '1' } }` instead of creating separate states like "todo 1 exists", "todo 2 exists"
  - Parameters enable providers to set up specific test data dynamically
  - Reusable state names make contracts easier to understand and maintain
- **Provider States format (Pact V3)**:
  - **String format**: `providerStates: 'todo exists'` - simple state name (for generic states without specific data)
  - **Array format with parameters**: `providerStates: [{ name: 'todo exists', params: { id: '1' } }]` - recommended format for reusability
  - Parameters format: `params: { key: 'value' }` - pass data needed for provider state setup
  - Use parameters when the state requires specific data (IDs, values, etc.) to enable reusability
- **Description**:
  - `description` is optional - if not provided, it will automatically use the test title
  - Provide a custom `description` only when you need a specific description different from the test title

**Conversion Notes**:

- Replace all `cy.intercept()` calls with `cy.pactIntercept()` across all test files in migration scope
- Always add `pactOptions` as fourth parameter with `providerStates` for all interactions
- `description` is optional - if not provided, it will automatically use the test title
- Use provider states with parameters for reusability: `providerStates: [{ name: 'state name', params: { key: 'value' } }]`
- Reuse state names across interactions with different parameters to avoid state multiplication
- Response formats: `{ statusCode: 200, body: [...] }` or just `[...]` (statusCode defaults to 200)
- All aliases, assertions, method/URL/response parameters work exactly the same
- Run tests to verify they work and pact files are generated
- Remove any manual pact file management (now automatic)
- Preserve all existing test logic, assertions, and aliases
- Provider names are automatically inferred from URLs
- **If migrating a subset**: Ensure only intercepts in scope are converted; others remain as `cy.intercept()`

### Step 3: Run Tests

- Run test suite using `cy.pactIntercept()`
- **Verify all tests pass first** (tests must pass to ensure conversion is successful)
- **Then verify pact generation**:
  - Verify pact files generated in `./pacts/` directory
  - Verify pact files contain all expected interactions
- Only proceed if tests pass and pact files are generated correctly

### Step 4: Optional Configuration

Update `pact.config.json` or `cypress.config.ts` plugin config:

- Custom consumer name, pactVersion (3.0.0 default, or 2.0.0, 4.0.0)
- Custom output directory (defaults to `./pacts`)
- Additional headers in `headersConfig.includes`
- `basePath` option to strip base path from URLs
- Matching rules for dynamic data (Pact V3/V4)

**Configuration priority**: Plugin config → Cypress.env('pact') → pact.config.json

## 5. Verify Migration

- **Build**: Run build command, verify no errors, TypeScript compiles
- **Tests**: Run test suite, verify all tests pass, pact files generated in `./pacts/`
- **Plugin**: Verify plugin registered in cypress.config.ts and lifecycle hooks working

## 6. Setup Pact Publishing

- Install: `npm install --save-dev @pact-foundation/pact-cli`
- Add to package.json scripts:
  ```json
  {
    "scripts": {
      "pact:publish": "pact-broker publish ./pacts --broker-base-url=$PACT_BROKER_BASE_URL --broker-token=$PACT_BROKER_TOKEN --consumer-app-version=$GIT_COMMIT --branch=$GIT_BRANCH"
    }
  }
  ```
- Environment variables (set in CI/CD):
  - `PACT_BROKER_BASE_URL`: Pact Broker URL
  - `PACT_BROKER_TOKEN`: Authentication token (if required)
  - `GIT_COMMIT`: Git commit SHA
  - `GIT_BRANCH`: Git branch name
- If custom `outputDir` in pact.config.json, update script path from `./pacts`

## 7. Update CI/CD Pipeline

- Detect existing pipeline (GitHub Actions, Jenkins, GitLab CI, Azure DevOps, CircleCI, etc.)
- Add steps to:
  - Run tests to generate contracts
  - **Publish contracts after successful tests on ALL branches** using `npm run pact:publish`
  - Optionally add can-i-deploy check before deployment (main/master/release branches only)
- Set environment variables in pipeline:
  - `PACT_BROKER_BASE_URL`, `PACT_BROKER_TOKEN`
  - `GIT_COMMIT` (usually `$GITHUB_SHA`, `$CI_COMMIT_SHA`, etc.)
  - `GIT_BRANCH` (usually `$GITHUB_REF_NAME`, `$CI_COMMIT_REF_NAME`, etc.)
- **Important**: Publish contracts on every branch where tests run, not just on merge to main

## 8. PR Description

Include:

- **Summary**: Migration to pact-js-mock for Pact contract generation
- **What changed**: Files modified (test files, configs), `cy.intercept()` → `cy.pactIntercept()` (with provider states added for all interactions using parameters for reusability), new files (pact.config.json, cypress.config.ts updates), dependencies added
- **How it works**: Contracts generated automatically, written to `./pacts/`, provider names inferred from URLs, provider states included for all interactions with parameters for reusability, all tests work unchanged
- **Testing**: All tests pass, contracts generated successfully
- **Next steps**: Set up Pact Broker env vars, configure publishing in CI/CD, review provider states for reusability, customize as needed
- **Breaking changes**: None
- **Configuration**: pact.config.json optional, sensible defaults used

## 9. Key Points

- **Cypress**: Use `cy.pactIntercept()` instead of `cy.intercept()`. Lifecycle is automatic.
- **Configuration**: pact.config.json optional, sensible defaults used.
- **Provider Names**: Automatically inferred from URLs (e.g., `*/todo-service/*` → provider: "todo-service")
- **Provider States**: Always add `providerStates` during conversion (Step 2) for all interactions. Use `providerStates` for Pact V3. Use parameters for reusability - reuse state names with different parameters instead of creating multiple states. This improves contract clarity and provider testability.
- **Zero Boilerplate**: No manual Pact instances or wrappers needed.
- **Backward Compatible**: All existing test code continues to work unchanged.

Proceed with analysis and conversion. Ask for clarification if information is missing or ambiguous.

**Note**: Instructions are complete and self-contained. Only refer to README.md if encountering unexpected issues.

## 10. Generated Contract Files

**Contract files are generated at the following path (share this path with your provider team):**

- **Path**: `./pacts/<consumer-name>-<provider-name>.json`
- **Example**: `./pacts/my-consumer-todo-service.json`
- **Naming convention**: `<consumer-name>-<provider-name>.json`
  - Consumer name: From `pact.config.json` or inferred from package.json
  - Provider name: Automatically inferred from URLs (e.g., `*/todo-service/*` → provider: "todo-service")
- **Content**: Files contain all interactions with provider states as defined in your tests
- **Usage**: Share these contract files with your provider team for contract testing
