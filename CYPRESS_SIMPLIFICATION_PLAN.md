# Cypress Integration Simplification Plan

## Executive Summary

This plan outlines a comprehensive simplification of the Cypress integration for `pact-js-mock`. The goal is to reduce setup complexity from 4+ manual steps to a single import, eliminate boilerplate lifecycle hooks, and provide a more intuitive API.

**Key Improvements**:
- **90% reduction in setup code**: Single import replaces multiple configuration steps
- **Zero boilerplate**: Automatic lifecycle management eliminates 3 hooks per test file
- **Simpler API**: New `cy.pactIntercept()` command combines intercept + pact recording
- **Backward compatible**: Old API continues to work with deprecation warnings

**Estimated Implementation Time**: 10-14 days

## Current State Analysis

### Current Complexity Points

1. **Manual Setup Required**:
   - Import commands in `cypress/support/commands.ts`
   - Configure plugin in `cypress.config.ts`
   - Manual lifecycle hook management (`before`, `beforeEach`, `after`)

2. **Boilerplate in Every Test File**:
   ```typescript
   before(() => {
     cy.reloadPact(pact)
   })
   
   beforeEach(() => {
     pact.setCurrentSource(Cypress.currentTest.title)
   })
   
   after(() => {
     cy.writePact(pact)
   })
   ```

3. **Complex API Usage**:
   - Users must understand `pact.toHandler()` method
   - Manual `cy.intercept()` + `pact.toHandler()` combination
   - Need to understand internal mechanics (reload, write, source tracking)

4. **Plugin Configuration**:
   - Manual plugin import and setup
   - Need to understand Cypress plugin architecture

## Goals

1. **Reduce Setup Complexity**: Single import should configure everything
2. **Eliminate Boilerplate**: Auto-manage lifecycle hooks
3. **Simplify API**: More intuitive commands that combine common patterns
4. **Better Developer Experience**: Less configuration, more convention

## Proposed Solution

### Phase 1: Auto-Setup Mechanism

#### 1.1 Auto-Configure Commands and Plugin
- Create a single entry point that auto-registers commands and plugin
- Users only need: `import 'pact-js-mock/lib/cypress'` in their support file
- Auto-detect and configure plugin in `cypress.config.ts` via helper

**Files to Create/Modify**:
- `src/cypress/index.ts` - Enhanced to auto-register commands
- `src/cypress/setup.ts` - New file for auto-setup logic
- `src/cypress/config-helper.ts` - Helper to modify cypress.config.ts

#### 1.2 Lifecycle Auto-Management
- Automatically handle `before`, `beforeEach`, `after` hooks
- Track pact instances automatically
- Auto-set test source from `Cypress.currentTest.title`

**Implementation**:
- Use Cypress hooks API to register lifecycle handlers automatically
- Maintain internal registry of pact instances
- Auto-cleanup and write pacts after tests

### Phase 2: Simplified API

#### 2.1 New `cy.pactIntercept()` Command
Combine `cy.intercept()` + `pact.toHandler()` into a single command:

```typescript
// Current (complex):
cy.intercept('GET', '/api/todos', pact.toHandler({
  description: 'get todos',
  response: { status: 200, body: [] }
})).as('getTodos')

// Proposed (simplified):
cy.pactIntercept('GET', '/api/todos', {
  description: 'get todos',
  response: { status: 200, body: [] }
}).as('getTodos')
```

**Benefits**:
- Less verbose
- More intuitive
- Automatically uses the registered pact instance

#### 2.2 Pact Instance Registration
- Allow registering a default pact instance globally
- Support multiple pacts with namespacing
- Auto-select pact based on context

**API Design**:
```typescript
// In support file or config:
cy.registerPact(pact) // Register default
cy.registerPact('rest-api', pact) // Register named pact

// In tests:
cy.pactIntercept('GET', '/api/todos', {...}) // Uses default
cy.pactIntercept('rest-api', 'GET', '/api/todos', {...}) // Uses named
```

### Phase 3: Configuration Simplification

#### 3.1 Configuration Helper
Provide a helper function to simplify `cypress.config.ts` setup:

```typescript
// Current:
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'
export default defineConfig({
  setupNodeEvents(on, config) {
    return pactPlugin(on, config)
  }
})

// Proposed:
import { withPact } from 'pact-js-mock/lib/cypress'
export default withPact(defineConfig({
  // ... other config
}))
```

#### 3.2 Smart Defaults
- Auto-detect pact files location
- Sensible default output directory
- Auto-cleanup old pact files if needed

### Phase 4: Enhanced Features

#### 4.1 Test Context Awareness
- Automatically track which test created which interactions
- Better error messages with test context
- Support for test grouping/namespacing

#### 4.2 Pact File Management
- Auto-merge interactions from multiple test files
- Better conflict resolution
- Support for parallel test execution

#### 4.3 Developer Experience Improvements
- Better TypeScript types and autocomplete
- Clearer error messages
- Debug mode for troubleshooting

## Implementation Plan

### Step 1: Create Auto-Setup Infrastructure
**Files**:
- `src/cypress/setup.ts` - Main setup logic
- `src/cypress/registry.ts` - Pact instance registry
- `src/cypress/lifecycle.ts` - Lifecycle hook management

**Tasks**:
- [ ] Implement pact instance registry
- [ ] Create auto-lifecycle hook registration
- [ ] Add automatic command registration
- [ ] Write tests for setup logic

### Step 2: Implement Simplified Commands
**Files**:
- `src/cypress/commands.ts` - Enhanced with new commands
- `src/cypress/types.ts` - Updated type definitions

**Tasks**:
- [ ] Implement `cy.pactIntercept()` command
- [ ] Implement `cy.registerPact()` command
- [ ] Update TypeScript definitions
- [ ] Write tests for new commands

### Step 3: Create Configuration Helpers
**Files**:
- `src/cypress/config-helper.ts` - Configuration utilities

**Tasks**:
- [ ] Implement `withPact()` wrapper
- [ ] Create auto-configuration detection
- [ ] Add configuration validation
- [ ] Write documentation

### Step 4: Update Documentation and Examples
**Files**:
- `README.md` - Update Cypress section
- `src/cypress/test/` - Update example tests

**Tasks**:
- [ ] Rewrite Cypress getting started guide
- [ ] Update example test files
- [ ] Create migration guide from old API
- [ ] Add troubleshooting section

### Step 5: Backward Compatibility
**Tasks**:
- [ ] Ensure old API still works (deprecated)
- [ ] Add deprecation warnings
- [ ] Create migration path documentation
- [ ] Maintain plugin and commands exports for compatibility

## Migration Path

### For Existing Users

1. **Gradual Migration**:
   - Old API continues to work
   - New API available alongside
   - Deprecation warnings guide migration

2. **Migration Steps**:
   ```typescript
   // Step 1: Replace manual setup with auto-setup
   // OLD: import 'pact-js-mock/lib/cypress/commands'
   // NEW: import 'pact-js-mock/lib/cypress'
   
   // Step 2: Remove lifecycle hooks
   // OLD: before(() => cy.reloadPact(pact))
   // NEW: (automatically handled)
   
   // Step 3: Use new command
   // OLD: cy.intercept(..., pact.toHandler(...))
   // NEW: cy.pactIntercept(..., {...})
   ```

## API Comparison

### Current API (Complex)
```typescript
// Setup
import 'pact-js-mock/lib/cypress/commands'
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'

// Config
setupNodeEvents(on, config) {
  return pactPlugin(on, config)
}

// Test file
before(() => cy.reloadPact(pact))
beforeEach(() => pact.setCurrentSource(Cypress.currentTest.title))
after(() => cy.writePact(pact))

cy.intercept('GET', '/api/todos', pact.toHandler({
  description: 'get todos',
  response: { status: 200, body: [] }
}))
```

### Proposed API (Simple)
```typescript
// Setup (one import)
import 'pact-js-mock/lib/cypress'

// Config (optional helper)
import { withPact } from 'pact-js-mock/lib/cypress'
export default withPact(defineConfig({...}))

// Test file (no lifecycle hooks needed)
cy.registerPact(pact) // Once, or in support file

cy.pactIntercept('GET', '/api/todos', {
  description: 'get todos',
  response: { status: 200, body: [] }
})
```

## Success Metrics

1. **Reduced Setup Steps**: From 4+ manual steps to 1 import
2. **Less Boilerplate**: Eliminate 3 lifecycle hooks per test file
3. **Simpler API**: Single command instead of command + method chain
4. **Better DX**: Clearer errors, better TypeScript support

## Risks and Mitigations

### Risk 1: Breaking Changes
**Mitigation**: Maintain backward compatibility, gradual deprecation

### Risk 2: Hidden Complexity
**Mitigation**: Clear documentation, debug mode, explicit opt-out

### Risk 3: Performance Impact
**Mitigation**: Lazy initialization, efficient registry, minimal overhead

### Risk 4: Cypress Version Compatibility
**Mitigation**: Test against multiple Cypress versions, clear version requirements

## Timeline Estimate

- **Phase 1** (Auto-Setup): 2-3 days
- **Phase 2** (Simplified API): 2-3 days
- **Phase 3** (Configuration): 1-2 days
- **Phase 4** (Enhancements): 2-3 days
- **Testing & Documentation**: 2-3 days

**Total**: ~10-14 days

## Next Steps

1. Review and approve this plan
2. Create feature branch
3. Implement Phase 1 (Auto-Setup)
4. Get feedback on Phase 1 before proceeding
5. Iterate through remaining phases
6. Update documentation
7. Release as minor version (backward compatible)
