# Cypress Integration Simplification Plan

## Executive Summary

This plan outlines a focused simplification of the Cypress integration for `pact-js-mock`. The goal is to keep setup minimal (support import + optional plugin), streamline the command surface, and automate pact metadata (consumer, provider, version) without extra boilerplate. The changes will ship in the next major release and therefore replace the legacy Cypress entry points.

**Key Improvements**:

- **Single support import**: `src/cypress/setup.ts` registers commands and lifecycle hooks in one place.
- **Plugin stays opt-in**: `src/cypress/plugin.ts` remains the dedicated Node entry without leaking into browser bundles.
- **Simpler API**: `cy.pactIntercept()` replaces manual `cy.intercept()` + `pact.toHandler()` usage.
- **Automatic metadata**: Consumer name and pact version come from Cypress config (defaulting to the host package) and provider names are inferred from intercepted URLs.

**Estimated Implementation Time**: 10-14 days

## Current State Analysis

### Current Complexity Points

1. **Fragmented setup**:
   - Commands/lifecycle must be wired manually in support files
   - Plugin registration can accidentally ship to the browser bundle

2. **Boilerplate in every spec**:
   - Repeated lifecycle hooks (`before`, `beforeEach`, `after`)
   - Manual pact registration per test file

3. **Metadata friction**:
   - Consumer/provider names must be manually supplied
   - No centralized opt-in for pact version overrides

4. **Cypress API mismatch**:
   - `cy.intercept()` requires explicit `pact.toHandler()` chaining
   - Users must remember to call both pieces correctly

## Goals

1. **Single support entry point**: One import (`src/cypress/setup.ts`) registers commands and lifecycle hooks.
2. **Keep plugin separate**: `src/cypress/plugin.ts` remains Node-only and optional.
3. **Rename intercept API**: `cy.pactIntercept()` becomes the primary DX-friendly wrapper.
4. **Automate metadata**: Consumer name/version come from Cypress config (defaulting to host package) and provider names are inferred from requests.

## Proposed Solution

### Phase 1: Core Auto-Setup

- Keep `src/cypress/setup.ts` as the single support import that registers commands and lifecycle hooks.
- Guard the setup so it never imports Node-only modules (e.g., `fs`), keeping the browser bundle clean.
- Maintain a light-weight registry so specs can register a pact once (default or named) and reuse it across tests.

### Phase 2: Simplified Command API

- Finalize `cy.pactIntercept()` as the ergonomic wrapper over `cy.intercept()`, keeping the same chaining semantics (e.g., `.as()`).
- Preserve `cy.registerPact()` to support default/named pact usage, but ensure the default path covers most scenarios.
- Surface the advanced overloads so tests can pass full interaction objects (description, provider states, matching rules, etc.) when needed.
- Keep the plugin as an optional import (`pact-js-mock/lib/cypress/plugin`) for teams that still manage pact files manually.

### Phase 3: Metadata Automation

- Read consumer name and optional pact specification version from Cypress config (`config.env.pact`), defaulting to the host package’s `name` and `version`.
- Infer provider names from intercepted URLs (e.g., `/order-service/v1/api` ⇒ `order-service`) with safe fallbacks and override hooks.
- Ensure every recorded interaction automatically includes the inferred metadata without extra user code.

### Phase 4: Documentation and Examples

- Update example specs under `src/cypress/test` to rely solely on the support import plus optional config overrides.
- Refresh README/migration guidance to describe the simplified flow (support import, optional plugin, `cy.pactIntercept()` usage, metadata defaults).
- Document provider inference rules, consumer overrides, and advanced usage patterns.

## Implementation Plan

### Step 1: Harden Auto-Setup

**Files**:

- `src/cypress/setup.ts`
- `src/cypress/registry.ts`
- `src/cypress/lifecycle.ts`

**Tasks**:

- [ ] Ensure setup import is idempotent and browser-safe
- [ ] Keep lifecycle hooks minimal (register once, reuse across specs)
- [ ] Confirm registry supports default and named pact registration

### Step 2: Finalize Command API

**Files**:

- `src/cypress/commands.ts`
- `src/cypress/types.ts`

**Tasks**:

- [ ] Align `cy.pactIntercept()` signature/chainability with `cy.intercept()`
- [ ] Ensure `cy.registerPact()` uses the registry + config metadata
- [ ] Update type definitions and add smoke coverage

### Step 3: Implement Metadata Defaults

**Files**:

- `cypress.config.ts` (docs/examples)
- `src/cypress/types.ts`
- `src/cypress/utils` (new helper if required)

**Tasks**:

- [ ] Read consumer name/version from `config.env.pact`, fallback to package.json
- [ ] Implement provider-name inference helper with override capability
- [ ] Pipe metadata into interaction recording automatically

### Step 4: Documentation & Examples

**Files**:

- `README.md`
- `MIGRATION_GUIDE.md`
- `src/cypress/test/`

**Tasks**:

- [ ] Update getting started guide to highlight minimal setup (support import + optional config)
- [ ] Adjust example specs to rely on inferred metadata instead of manual pact files
- [ ] Document override mechanisms, advanced `cy.pactIntercept()` usage (full interactions, matching rules), and plugin usage for power users

## Migration Path

### For Existing Users

1. **Breaking Upgrade**:
   - Legacy command/plugin imports are removed in this major release.
   - Tests must adopt the new support import and `cy.pactIntercept()` API.
   - Cypress config overrides (`config.env.pact`) remain optional but provide metadata control.

2. **Migration Steps**:

   ```typescript
   // Step 1: Import the simplified setup once in support
   import 'pact-js-mock/lib/cypress'

   // Step 2: (Optional) add pact metadata overrides
   // cypress.config.ts
   export default defineConfig({
     env: {
       pact: {
         consumerName: 'my-consumer',
         pactVersion: '2.0.0',
       },
     },
   })

   // Step 3: Use the new command in specs
   cy.pactIntercept('GET', '/order-service/v1/api/orders', {...})
   // provider inferred as "order-service"
   ```

## API Comparison

### Current API (Complex)

```typescript
// support/component.ts
import 'pact-js-mock/lib/cypress/commands'

// cypress.config.ts
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'
export default defineConfig({
  component: {
    setupNodeEvents(on, config) {
      return pactPlugin(on, config)
    },
  },
})

// Spec file
before(() => cy.reloadPact(pact))
beforeEach(() => pact.setCurrentSource(Cypress.currentTest.title))
after(() => cy.writePact(pact))

cy.intercept(
  'GET',
  '/order-service/v1/api/orders',
  pact.toHandler({
    description: 'get orders',
    response: { status: 200, body: [] },
  }),
)
```

### Proposed API (Simple)

```typescript
// support/component.ts
import 'pact-js-mock/lib/cypress'

// cypress.config.ts (optional overrides)
export default defineConfig({
  env: {
    pact: { consumerName: 'web-app', pactVersion: '2.0.0' },
  },
})

// Spec file
cy.registerPact(pact) // once per file or via support

// Simple usage (response body only)
cy.pactIntercept('GET', '/order-service/v1/api/orders', [
  { id: '1', status: 'READY' },
])

// Advanced usage (custom interaction)
cy.pactIntercept('GET', '/order-service/v1/api/orders', {
  description: 'get orders',
  providerState: 'orders exist',
  response: {
    status: 200,
    body: [{ id: '1', status: 'READY' }],
    matchingRules: {
      '$.body[0].status': { match: 'regex', regex: 'READY|PENDING' },
    },
  },
})
// provider inferred as "order-service"
```

## Success Metrics

1. **Setup simplicity**: Single support import + optional config cover mainstream usage.
2. **Zero manual metadata**: Consumer/provider defaults populate automatically.
3. **API clarity**: `cy.pactIntercept()` mirrors Cypress ergonomics.
4. **Upgrade clarity**: Migration steps clearly outline breaking changes and required updates.

## Risks and Mitigations

### Risk 1: Missing metadata overrides

**Mitigation**: Provide explicit config shape (`config.env.pact`) and document how to override per project/spec.

### Risk 2: Provider inference edge cases

**Mitigation**: Allow manual overrides, add safe fallbacks, and surface debug logging or warnings.

### Risk 3: Browser bundle pollution

**Mitigation**: Keep plugin/Node code behind separate imports; add tests preventing accidental `fs` usage in the browser path.

### Risk 4: Cypress compatibility

**Mitigation**: Validate against supported Cypress versions and document minimum requirements.

### Risk 5: Upgrade friction for existing users

**Mitigation**: Provide clear migration guides, codemod examples where feasible, and communicate breaking changes in release notes.

## Timeline Estimate

- **Phase 1** (Core Auto-Setup): 2-3 days
- **Phase 2** (Command API): 2-3 days
- **Phase 3** (Metadata Defaults): 1-2 days
- **Phase 4** (Docs & Examples): 2-3 days
- **Testing & Documentation**: 2-3 days

**Total**: ~10-14 days

## Next Steps

1. Review and approve this plan
2. Create feature branch
3. Implement Phase 1 (Core Auto-Setup)
4. Get feedback on Phase 1 before proceeding
5. Iterate through remaining phases
6. Update documentation
7. Release as major version (breaking changes documented)
