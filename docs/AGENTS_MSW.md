Convert existing MSW (Mock Service Worker) test mocks to generate Pact consumer contracts with pact-js-mock.

## 1. Analyze Codebase

Determine:

- MSW version (check package.json for `msw` dependency, must be >= 2.4.11 and < 3.0.0)
- Testing framework (Jest, Mocha, Vitest)
- Package manager (npm, yarn, pnpm)
- Language (JavaScript or TypeScript)
- API types (REST APIs, GraphQL queries/mutations, or both)
- Handler locations (src/mocks, src/handlers, etc.)
- Test locations (src/**/\*.test.ts, src/**/\*.spec.ts, etc.)
- Consumer name (infer from package.json name or project structure)
- Provider names (infer from URLs or service names)
- Existing pact.config.json file

## 2. Validate Compatibility - STOP IF NOT MET

**⚠️ CRITICAL: Do NOT proceed if conditions are not met:**

- **Language**: MUST be JavaScript or TypeScript (Node.js). STOP if other languages.
- **MSW**: MUST have:
  - `msw` package installed
  - MSW version >= 2.4.11 and < 3.0.0 (verify in package.json)
  - MSW handlers importing from 'msw'
  - Tests using MSW handlers (via setupServer or similar)
- **Test Files**: MUST have test files using MSW handlers. STOP if none found.

**If conditions not met:**

- STOP immediately
- Inform user which requirements are missing
- Do NOT proceed with code changes

## 3. Determine Migration Scope - MANDATORY BEFORE PROCEEDING

**⚠️ MANDATORY: You MUST ask the user to decide migration scope before starting. Do NOT proceed to section 4 until the user has decided.**

**Ask the user to decide migration scope:**

- **Migrate all handlers**: Convert all MSW handler files from 'msw' imports to 'pact-js-mock/lib/msw' imports
  - Recommended for new projects or when ready to fully adopt Pact
  - Simplifies contract management with complete coverage
- **Migrate subset of handlers**: Convert only specific handler files
  - Recommended for gradual migration or when only certain APIs need contracts
  - Identify which handlers to migrate based on:
    - Critical API endpoints
    - External service dependencies
    - APIs that change frequently
    - Provider services that need contract testing

**If migrating a subset:**

- Identify handler files to migrate
- List the specific endpoints/URLs to convert
- Document which handlers will remain using 'msw' imports (not converted)
- Plan to migrate remaining handlers in future iterations

**⚠️ CRITICAL:**

- **STOP** and wait for user's decision on migration scope
- **Do NOT proceed** to section 4 (Setup and Conversion) until the user has explicitly decided
- Once the user confirms the migration scope, document it and then proceed to section 4

## 4. Setup and Conversion

### Step 1: Minimal Setup

- Install: `npm install --save-dev pact-js-mock` (or yarn/pnpm equivalent)
- Ensure `msw` is already installed (pact-js-mock works with existing MSW setup)
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
- Infer consumer name from package.json name or project structure
- Minimal config ensures only `content-type` header is included in pact files

### Step 2: Replace Handler Imports and Complete Conversion

- Find handler files importing from 'msw' (within migration scope determined in section 3)
- Replace MSW imports with pact-js-mock imports:
  - REST: `import { http, HttpResponse } from 'msw'` → `import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'`
  - GraphQL: `import { graphql, HttpResponse } from 'msw'` → `import { pactGraphql as graphql, HttpResponse } from 'pact-js-mock/lib/msw'`
- **Keep all handler code exactly the same** - API is identical to MSW, only import changes

**Examples:**

**Conversion examples (always include provider states):**

```typescript
// Before
import { http, HttpResponse } from 'msw'
export const getMovies = http.get('*/movies', () => {
  return HttpResponse.json([{ id: 1, name: 'Movie 1' }])
})

// After - always add providerStates for better contract clarity
// description is optional - will use test name by default if not provided
import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'
export const getMovies = http.get(
  '*/movies',
  () => {
    return HttpResponse.json([{ id: 1, name: 'Movie 1' }])
  },
  {
    providerStates: 'movies service is available', // Reusable state
    // description: 'get movies list', // Optional - defaults to test name
  },
)
```

**Conversion with parameters (for reusability):**

```typescript
// Before
import { http, HttpResponse } from 'msw'
export const getUserProfile = http.get('*/users/:id', () => {
  return HttpResponse.json({ id: 1, name: 'John' })
})

// After - use parameters for reusable states
// description is optional - will use test name by default
import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'
export const getUserProfile = http.get(
  '*/users/:id',
  () => {
    return HttpResponse.json({ id: 1, name: 'John' })
  },
  {
    providerStates: [
      {
        name: 'user exists', // Reusable state name
        params: { id: '1' }, // Parameters enable reusability with different values
      },
    ],
    // description: 'get user profile', // Optional - defaults to test name
  },
)

// Same state can be reused with different parameters
export const getUserProfile2 = http.get(
  '*/users/:id',
  () => {
    return HttpResponse.json({ id: 2, name: 'Jane' })
  },
  {
    providerStates: [
      {
        name: 'user exists', // Same state name - reusable
        params: { id: '2' }, // Different parameter value
      },
    ],
    // description: 'get user profile', // Optional - defaults to test name
  },
)
```

**Conversion with provider states (for error scenarios):**

```typescript
// Before
import { http, HttpResponse } from 'msw'
export const getUserProfileNotFound = http.get('*/users/:id', () => {
  return HttpResponse.json({ error: 'User not found' }, { status: 404 })
})

// After - add providerStates for error scenarios
// description is optional - will use test name by default
import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'
export const getUserProfileNotFound = http.get(
  '*/users/:id',
  () => {
    return HttpResponse.json({ error: 'User not found' }, { status: 404 })
  },
  {
    providerStates: [
      {
        name: 'user does not exist', // Reusable error state
        params: { id: '999' }, // Parameters specify which user doesn't exist
      },
    ],
    // description: 'get user profile returns not found', // Optional - defaults to test name
  },
)
```

**Provider States Guidelines (Pact V3):**

- **Always use provider states**: Add provider states to all interactions for better contract clarity and provider testability
  - Success scenarios: Describe the state needed for the interaction (e.g., "todo exists", "user is authenticated", "order is pending")
  - Error scenarios: Describe the state that leads to the error (e.g., "todo does not exist", "user is not authorized", "order not found")
  - Service availability: Use generic states for service-level setup (e.g., "users service is available", "movies service is available")
- **Reusability through parameters**:
  - Use the same state name with different parameters to avoid state multiplication
  - Example: Use `{ name: 'user exists', params: { id: '1' } }` instead of creating separate states like "user 1 exists", "user 2 exists"
  - Parameters enable providers to set up specific test data dynamically
  - Reusable state names make contracts easier to understand and maintain
- **Provider States format (Pact V3)**:
  - **String format**: `providerStates: 'user exists'` - simple state name (for generic states without specific data)
  - **Array format with parameters**: `providerStates: [{ name: 'user exists', params: { id: '1' } }]` - recommended format for reusability
  - Parameters format: `params: { key: 'value' }` - pass data needed for provider state setup
  - Use parameters when the state requires specific data (IDs, values, etc.) to enable reusability
- **Description**:
  - `description` is optional - if not provided, it will automatically use the test name
  - Provide a custom `description` only when you need a specific description different from the test name

**Conversion Notes**:

- Replace imports in all handler files (within migration scope)
- Just change the import statement, keep all handler code exactly the same
- Always add Pact options as third parameter with `providerStates` for all handlers
- `description` is optional - if not provided, it will automatically use the test name
- Use provider states with parameters for reusability: `providerStates: [{ name: 'state name', params: { key: 'value' } }]`
- Reuse state names across handlers with different parameters to avoid state multiplication
- Run tests to verify handlers still work and pact files are generated
- Preserve all existing handler logic, response structures, and error handling
- Provider names are automatically inferred from URLs
- **If migrating a subset**: Ensure only handlers in scope are converted; others remain using 'msw' imports

### Step 3: Add Lifecycle Hooks (MANDATORY)

Add to test files using MSW handlers (Jest/Mocha/Vitest):

- `beforeAll` / `before`: Import and call `deletePacts(pactRegistry)` to clean up existing pact files
- `beforeEach`:
  - Import and call `setCurrentSourceForPacts(pactRegistry, testName)` to set current test name
  - Import and call `reloadPacts(pactRegistry)` to reload existing pact files
- `afterEach`: Import and call `writePacts(pactRegistry)` to persist interactions
- Import utilities: `deletePacts`, `reloadPacts`, `writePacts`, `setCurrentSourceForPacts` from 'pact-js-mock/lib/utils'
- Import `pactRegistry` from 'pact-js-mock/lib/msw'
- Ensure MSW server setup (setupServer) is properly configured
- Add hooks to ONE test file first, test it, then add to all other test files using MSW handlers
- All existing test assertions and logic remain unchanged

### Step 4: Run Tests

- Run test suite using converted handlers
- **Verify all tests pass first** (tests must pass to ensure conversion is successful)
- **Then verify pact generation**:
  - Verify pact files generated in `./pacts/` directory
  - Verify pact files contain all expected interactions
- Only proceed if tests pass and pact files are generated correctly

### Step 5: Optional Configuration

Update `pact.config.json`:

- Custom consumer name, pactVersion (3.0.0 default, or 2.0.0, 4.0.0)
- Custom output directory (defaults to `./pacts`)
- Additional headers in `headersConfig.includes`
- `basePath` option to strip base path from URLs
- Matching rules for dynamic data (Pact V3/V4) as third parameter to handlers

## 5. Verify Migration

- **Build**: Run build command, verify no errors, TypeScript compiles
- **Tests**: Run test suite, verify all tests pass, pact files generated in `./pacts/`
- **Lifecycle hooks**: Verify hooks properly added to all test files using MSW handlers

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
- **What changed**: Files modified (handler files, test files, configs), 'msw' → 'pact-js-mock/lib/msw' imports (with provider states added for all interactions using parameters for reusability), new files (pact.config.json, lifecycle hooks), dependencies added
- **How it works**: Contracts generated automatically, written to `./pacts/`, provider names inferred from URLs, provider states included for all interactions with parameters for reusability, all tests work unchanged
- **Testing**: All tests pass, contracts generated successfully
- **Next steps**: Set up Pact Broker env vars, configure publishing in CI/CD, review provider states for reusability, customize as needed
- **Breaking changes**: None
- **Configuration**: pact.config.json optional, sensible defaults used

## 9. Key Points

- **MSW**: API is identical to MSW - just change imports. Lifecycle hooks are MANDATORY.
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
