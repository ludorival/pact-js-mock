# How to implement Contract Test with Pact by leveraging existing mocks

> **🚀 Quick Start**: Want to jump straight to implementation? [Use AI to generate your contract tests](#-quick-start-use-ai-to-generate-your-contract-tests) - No need to read the full tutorial!

## Motivation: Why Leverage Existing Mocks? 🤔

### The Problem with Traditional Contract Testing

Contract testing with Pact is a powerful technique for ensuring compatibility between services in a microservices architecture. However, it often comes with a significant challenge: **developers need to write additional tests** to generate consumer contracts. And let's be honest, who has time for that? 😅

Consider the typical workflow (and why it's a bit of a pain):

1. Developers write unit tests using mocks
2. To add contract testing, they must write **separate** Pact consumer tests (ugh, more code to maintain!)
3. This results in duplicate test code, maintaining two sets of mocks, and increased development time (because we all love maintaining duplicate code, right? 🙄)

Many developers are hesitant to adopt contract testing because:

- **Extra work**: Writing and maintaining additional tests feels like overhead (we're already busy enough!)
- **Code duplication**: The same mock data exists in multiple places (DRY? What's that?)
- **Time constraints**: Teams prioritize feature development over additional test infrastructure (shipping features > writing more tests)
- **Complexity**: Learning Pact's DSL adds cognitive load (another thing to learn? No thanks!)

### The Solution: Leverage Existing Mocks ✨

Instead of writing new tests, what if we could **automatically generate Pact contracts from the mocks we're already using**? Sounds like magic, right? Well, it kind of is! 🪄 This approach offers several benefits:

1. **Zero additional test code**: Your existing tests become contract tests automatically (no extra work, just pure win!)
2. **Single source of truth**: Mocks are defined once, contracts are generated from them (DRY principle, finally!)
3. **Ensures mocks fit reality**: Contract verification ensures your mocks match what the real provider actually returns (catch mismatches before they cause issues!)
4. **Gradual adoption**: Start with existing tests, expand coverage over time (no need to rewrite everything at once)
5. **Developer-friendly**: No need to learn Pact DSL; use familiar mocking libraries (use what you already know!)
6. **Reduced maintenance**: Changes to mocks automatically update contracts (one less thing to worry about)

### How It Works 🛠️

By using libraries like [`pact-js-mock`](https://github.com/ludorival/pact-js-mock) for frontend applications and [`pact-jvm-mock`](https://github.com/ludorival/pact-jvm-mock) for JVM-based backends, we can:

- **Frontend**: Convert Cypress `cy.intercept()` calls or MSW handlers `http.get()` into Pact contracts (just swap a few method names!)
- **Backend**: Convert Mockito or MockK mocks (with Spring RestTemplate) into Pact contracts (your existing tests are already 90% there!)

This tutorial demonstrates how to transform your existing test mocks into comprehensive Pact contracts with minimal changes to your codebase.

---

## 🚀 Quick Start: Use AI to Generate Your Contract Tests

> **For developers who want to jump straight to implementation**: Use AI prompts with GitHub Copilot, Cursor, or other AI coding assistants to automatically convert your existing mocks into Pact contracts. Skip to the detailed steps later if you need more context.

### Using AI Agents for Quick Setup 🤖

We've created detailed AI prompts that handle the conversion process for you. Use these with your AI coding assistant:

**Frontend (JavaScript/TypeScript):**

- **Cypress**: [AGENTS_CYPRESS.md](https://github.com/ludorival/pact-js-mock/blob/main/docs/AGENTS_CYPRESS.md) - Convert `cy.intercept()` to `cy.pactIntercept()`
- **MSW**: [AGENTS_MSW.md](https://github.com/ludorival/pact-js-mock/blob/main/docs/AGENTS_MSW.md) - Convert MSW handlers for Jest, Vitest, or Mocha

**Backend (JVM):**

- **Consumer contracts**: [AGENTS_CONSUMER.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_CONSUMER.md) - Convert Mockito/MockK tests to generate contracts
- **Provider verification**: [AGENTS_PROVIDER_VERIFICATION.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_PROVIDER_VERIFICATION.md) - Set up provider verification tests

These prompts guide your AI assistant to analyze your codebase, convert existing mocks, set up contract publishing, and update CI/CD pipelines—all while keeping your existing test logic intact.

**Note**: Always review AI-generated code to ensure it matches your project's standards and requirements.

---

## Let's get started! 🎉

In this tutorial, we'll explore how to implement contract testing using Pact in a microservices architecture. Our example consists of three components (think of them as our test subjects):

- [`shop-frontend`](https://github.com/ludorival/shop-pact-mock-frontend): A web application with Cypress tests (the pretty face of our shop)
- [`order-service`](https://github.com/ludorival/order-service-pact-mock-demo): A Springboot application handling orders written in Kotlin and using MockK for mocking (the brain that processes orders)
- [`inventory-service`](https://github.com/ludorival/inventory-service-pact-mock-demo): Another Springboot application managing inventory written in Kotlin and also using MockK (the warehouse keeper)

These repositories will serve as the base code for this tutorial. We'll build step-by-step instructions on top of them, illustrating how to implement contract testing in real applications. No fake examples here - just real, working code! 💪

Before we dive into the architecture, let's see what we're building! Here's our shop-frontend in action:

![Shop Frontend Demo](./new%20amazon.gif)

_Okay, okay, it's not about to replace Amazon, but you get the idea, right?_ 😄🛒

As you can see, it's a simple e-commerce interface where users can browse products, add items to their cart, and place orders. Pretty standard stuff, but perfect for demonstrating contract testing in action!

Now, let's talk architecture. Our microservices setup follows a simple request flow:

```mermaid
graph LR
    A[shop-frontend] --> B[order-service]
    B --> C[inventory-service]
```

Here's how it works: when a user interacts with the `shop-frontend` (like placing an order), it makes API calls to the `order-service`. The `order-service` then communicates with the `inventory-service` to check stock availability and update inventory levels. Each service has its own responsibilities, and they need to communicate seamlessly - which is exactly where contract testing comes in! 🎯

## Prerequisites 📋

Before we dive in, make sure you have:

- Node.js installed
- JVM environment (Maven, Kotlin) for backend services
- Docker for running Pact Broker (or use PactFlow if you prefer the managed route)
- GitHub account to clone the demo repository

## 1. Deploy Pact Broker 🚀

First things first - we need somewhere to store our contracts! You have two options :

### Option A: Using PactFlow (Managed Service) ☁️

The easy way :

1. Create an account on [PactFlow](https://pactflow.io/) (it's free to start!)
2. Get your API token
3. Set environment variables:

```bash
export PACT_BROKER_URL=https://your-org.pactflow.io
export PACT_BROKER_TOKEN=your-token
```

### Option B: Self-hosted with Docker 🐳

Want to run it yourself? No problem! For a complete self-hosted setup with PostgreSQL:

```bash
# Start PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=pact -d -p 5432:5432 postgres

# Start Pact Broker
docker run --name pact-broker \
  --link postgres:postgres \
  -e PACT_BROKER_DATABASE_URL=postgres://postgres:password@postgres/pact \
  -e PACT_BROKER_PORT=9292 \
  -d -p 9292:9292 \
  pactfoundation/pact-broker
```

Alternatively, use Docker Compose for easier management:

```yaml:docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pact
    ports:
      - "5432:5432"

  pact-broker:
    image: pactfoundation/pact-broker
    ports:
      - "9292:9292"
    environment:
      PACT_BROKER_DATABASE_URL: postgres://postgres:password@postgres/pact
      PACT_BROKER_PORT: 9292
    depends_on:
      - postgres
```

Then run:

```bash
docker-compose up -d
```

Access the Pact Broker at `http://localhost:9292` - open it in your browser and admire the empty broker

## 2. Publish Contract between shop-frontend and order-service 🎯

Alright, time for the fun part! Let's make our frontend generate contracts. This is where the magic happens ✨

![QA Testing Meme](https://mailtrap.io/wp-content/uploads/2020/06/testing_meme3.png)

> **🤖 AI Agent Prompt**: Want to automate this migration? Use the [AGENTS_CYPRESS.md](./AGENTS_CYPRESS.md) prompt with your AI coding assistant (Copilot, Cursor, etc.) to automatically convert your existing `cy.intercept()` calls to `cy.pactIntercept()` and generate Pact contracts. The agent will handle the entire migration process for you!

> **Reference Implementation**: See the complete working example in [shop-pact-mock-frontend](https://github.com/ludorival/shop-pact-mock-frontend/pull/10)

### Step 1: Install Dependencies 📦

First, let's get the tools we need. Install the required dependencies:

```bash
npm install --save-dev pact-js-mock @pact-foundation/pact-cli
```

### Step 2: Setup Cypress Plugin ⚙️

Now let's configure Cypress to work with Pact. Update your `cypress.config.ts` to register the Pact plugin. For component tests, you need to add `setupNodeEvents` (don't worry, it's just a few lines):

```typescript:cypress.config.ts
import { defineConfig } from "cypress";
import pactPlugin from 'pact-js-mock/lib/cypress/plugin';

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    setupNodeEvents(on, config) {
      return pactPlugin(on, config);
    },
  },
});
```

**Note**: If you're using E2E tests instead of component tests, the structure is slightly different (but still super simple):

```typescript:cypress.config.ts
import { defineConfig } from "cypress";
import pactPlugin from 'pact-js-mock/lib/cypress/plugin';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return pactPlugin(on, config, {
        consumerName: 'shop-frontend',
        pactVersion: '4.0.0',
      });
    },
  },
});
```

### Step 3: Import Cypress Support 📥

Almost there! Add the Cypress support import to your support file (just one line, we promise):

```typescript:cypress/support/component.ts
import './commands'
import 'pact-js-mock/lib/cypress'

// ... rest of your support file
```

### Step 4: Convert Existing Mocks to Pact Intercepts 🔄

Here's where it gets exciting! Looking at our example code, we can see the frontend already has mocks in the Cypress tests using `cy.intercept()`:

```typescript:src/App.cy.tsx
  beforeEach(() => {
    cy.intercept('GET', `v1/items`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Test Item 1',
          description: 'This is a test item',
          stockCount: 5,
        },
        {
          id: 2,
          name: 'Test Item 2',
          description: 'This is another test item',
          stockCount: 3,
        },
      ],
    }).as('getItems')
  })
```

Now for the magic trick: to generate Pact contracts, we simply replace `cy.intercept()` with `cy.pactIntercept()`. That's it! The API is nearly identical (seriously, it's almost too easy):

```typescript:src/App.cy.tsx
  beforeEach(() => {
    cy.pactIntercept('GET', `v1/items`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Test Item 1',
          description: 'This is a test item',
          stockCount: 5,
        },
        {
          id: 2,
          name: 'Test Item 2',
          description: 'This is another test item',
          stockCount: 3,
        },
      ],
    }).as('getItems')
  })

  it('allows selecting quantity and buying items', () => {
    cy.pactIntercept('POST', `v1/purchase`, {
      statusCode: 200,
    }).as('purchase')

    cy.mount(<App />)
    cy.wait('@getItems')

    // Select quantity from dropdown
    cy.get('.ant-select').first().click()
    cy.get('.ant-select-item-option').contains('3').click()

    // Click buy button
    cy.get('button').contains('Buy Now').first().click()

    // Verify purchase request
    cy.wait('@purchase').its('request.body').should('deep.equal', {
      itemId: 1,
      quantity: 3,
    })
  })

  it('handles purchase errors correctly', () => {
    cy.pactIntercept('POST', `v1/purchase`, {
      statusCode: 500,
    }).as('purchaseError')

    cy.mount(<App />)
    cy.wait('@getItems')

    cy.get('button').contains('Buy Now').first().click()
    cy.get('.ant-alert-error').should('be.visible')
    cy.contains('Unable to complete purchase').should('be.visible')
  })
```

That's literally it! 🎉 The `cy.pactIntercept()` command automatically:

- Records the request/response interactions
- Maintains the same behavior as `cy.intercept()` for your tests (your tests won't even notice the difference)

### Step 5: Configure Pact Output 🎨

Want to customize things? Create a `pact.config.json` file (optional, but sometimes it's nice to have control):

```json:pact.config.json
{
  "consumer": {
    "name": "shop-frontend"
  },
  "pactDir": "./pacts",
  "pactSpecificationVersion": "4.0.0",
  "options": {
    "headersConfig": {
      "includes": ["content-type"]
    }
  }
}
```

**Note**: The `headersConfig` option controls which HTTP headers are included in your Pact contracts. The `includes` array specifies which headers to include (e.g., `["content-type"]`). This helps keep contracts clean by excluding unnecessary or sensitive headers like cookies or authorization tokens.

### Step 6: Run Tests and Generate Contracts 🏃

Time to see the magic happen! When you run your Cypress tests, Pact contracts will be automatically generated (no extra steps needed):

```bash
npm test
```

After running tests, you'll find the generated Pact contract in `pacts/shop-frontend-order-service.json` :

```json:pacts/shop-frontend-order-service.json
{
  "consumer": {
    "name": "shop-frontend"
  },
  "provider": {
    "name": "order-service"
  },
  "metadata": {
    "pactSpecification": {
      "version": "4.0.0"
    },
    "client": {
      "name": "pact-js-mock",
      "version": "0.5.0"
    }
  },
  "interactions": [
    {
      "description": "GET v1/items",
      "response": {
        "status": 200,
        "body": [
          {
            "id": 1,
            "name": "Test Item 1",
            "description": "This is a test item",
            "stockCount": 5
          },
          {
            "id": 2,
            "name": "Test Item 2",
            "description": "This is another test item",
            "stockCount": 3
          }
        ]
      },
      "request": {
        "method": "GET",
        "path": "/v1/items"
      }
    },
    {
      "description": "POST v1/purchase",
      "response": {
        "status": 200
      },
      "request": {
        "method": "POST",
        "path": "/v1/purchase",
        "body": {
          "itemId": 1,
          "quantity": 3
        }
      }
    }
  ]
}
```

### Step 7: Publish Contracts to Pact Broker 📤

Now let's share our contracts with the world (or at least with the Pact Broker)! Add scripts to your `package.json` to publish contracts:

> **Tip:** These scripts use the `$GIT_COMMIT` environment variable to track the version of the contracts being published. If it's not already set in your environment, you can set it to the latest Git commit hash with:
>
> ```bash
> export GIT_COMMIT=$(git rev-parse --short HEAD)
> ```

```json:package.json
{
  "scripts": {
    "test": "cypress run --component",
    "pact:publish": "pact-broker publish ./pacts --broker-base-url=$PACT_BROKER_URL --broker-token=$PACT_BROKER_TOKEN --consumer-app-version=$GIT_COMMIT",
    "pact:can-i-deploy": "pact-broker can-i-deploy --broker-base-url=$PACT_BROKER_URL --broker-token=$PACT_BROKER_TOKEN --pacticipant=shop-frontend --version=$GIT_COMMIT"
  }
}
```

After running tests and generating contracts, publish them to the Pact Broker:

```bash
npm run pact:publish
```

Check your Pact Broker - you should see your contract there! 🎊

### Step 8: Check Deployment Readiness with `can-i-deploy` ✅

Before deploying, it's crucial to verify that your contracts are compatible with all providers. The `can-i-deploy` command checks if it's safe to deploy a specific version of your application:

```bash
npm run pact:can-i-deploy
```

This command will:

- Check if all contracts have been verified by their providers on the **main branch**
- Ensure there are no breaking changes that would affect other services
- Return a success status if deployment is safe, or fail if there are compatibility issues

![CAN-I-DEPLOY](https://preview.redd.it/xtbwyzwng8r91.jpg?width=320&crop=smart&auto=webp&s=eea82dc35e379200e95808f3f668047f516e8a36)

> **⚠️ Important Note About `can-i-deploy` on First Run:**
>
> When you publish your first contract and run `can-i-deploy` in CI, **it will fail** - and that's completely normal! 😊 Here's why:
>
> - The `can-i-deploy` check verifies that all contracts have been verified by their providers on the **main branch**
> - On the first run, the provider hasn't verified the contract on main yet (you haven't implemented and merged provider verification tests!)
> - This is expected behavior and not an error
>
> **To make `can-i-deploy` pass:**
>
> 1. Implement provider verification tests (see [Section 3: Implement Order Service Verifier](#3-implement-order-service-verifier-))
> 2. Raise a PR in the provider service repository with the verification tests
> 3. Review and merge the PR to the provider's main branch
> 4. The provider's CI/CD pipeline will automatically run verification tests on main and publish results to the Pact Broker
> 5. Once verification results are published from the provider's main branch, simply **re-run the consumer's CI job** - the `can-i-deploy` check will now pass! 🎉
>
> This is the beauty of contract testing - it ensures both sides are in sync on main before deployment! 🎯

## 3. Implement Order Service Verifier ✅

Now let's make sure the order-service actually fulfills the contract. In the order-service project, create a Pact provider verification test. First, add the necessary dependencies:

![QA Testing Meme](https://mailtrap.io/wp-content/uploads/2020/06/testing_meme12.jpg)

> **🤖 AI Agent Prompt**: Want to automate provider verification setup? Use the [AGENTS_PROVIDER_VERIFICATION.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_PROVIDER_VERIFICATION.md) prompt with your AI coding assistant to automatically create provider verification tests, configure Pact Broker integration, and update your CI/CD pipeline. The agent will handle the entire setup process for you!

> **Reference Implementation**: See the complete working example in [order-service-pact-mock-demo](https://github.com/ludorival/order-service-pact-mock-demo/pull/13)

### Step 1: Copy Consumer Contract 📋

First, copy the consumer contract file from the consumer project to the provider project:

- Pact files are generated at `./pacts/<consumer-name>-<provider-name>.json` in the consumer project (e.g., `./pacts/shop-frontend-order-service.json`)
- Copy this file to the `pacts` directory in your provider project (create the directory if it doesn't exist)
- This allows you to test locally before setting up the Pact Broker

### Step 2: Add Dependencies 📦

Add the Pact provider dependencies to your `pom.xml`:

```xml:pom.xml
<dependency>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>junit5</artifactId>
    <version>4.6.4</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>spring</artifactId>
    <version>4.6.4</version>
    <scope>test</scope>
</dependency>
```

### Step 3: Implement Verifier Tests (Local) 🧪

Create a provider verification test that loads contracts from local files:

```kotlin:src/test/kotlin/com/example/orderservice/pact/OrderServiceContractTest.kt
import au.com.dius.pact.provider.junit5.HttpTestTarget
import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.loader.PactFolder
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@Provider("order-service")
@PactFolder("pacts") // Load pact files from local 'pacts' directory
class OrderServiceContractTest {

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider::class)
    fun pactVerificationTestTemplate(context: PactVerificationContext) {
        context.verifyInteraction()
    }

    @BeforeEach
    fun before(context: PactVerificationContext) {
        context.target = HttpTestTarget("localhost", 8080)
    }
}
```

Run the test locally to verify your service satisfies the contract before moving to the Pact Broker.

### Step 4: Change the Verifier to Use Pact Broker 🔄

Once local testing is successful, update the test to use the Pact Broker for CI/CD integration:

```kotlin:src/test/kotlin/com/example/orderservice/pact/OrderServiceContractTest.kt
import au.com.dius.pact.provider.junit5.HttpTestTarget
import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.junitsupport.loader.PactBrokerAuth
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@Provider("order-service")
@PactBroker(
    url = "\${PACT_BROKER_URL}",
    authentication = PactBrokerAuth(token = "\${PACT_BROKER_TOKEN}")
)
class OrderServiceContractTest {

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider::class)
    fun pactVerificationTestTemplate(context: PactVerificationContext) {
        context.verifyInteraction()
    }

    @BeforeEach
    fun before(context: PactVerificationContext) {
        context.target = HttpTestTarget("localhost", 8080)
    }
}
```

Create a `src/test/resources/application.yml` file to enable publishing verification results:

```yaml:src/test/resources/application.yml
pact:
  verifier:
    publishResults: true
  provider:
    version: ${GIT_COMMIT:local}
```

This test will:

1. Start your Spring Boot application
2. Fetch contracts from the Pact Broker
3. Verify that your application satisfies all consumer contracts
4. Publish verification results back to the broker

### Step 5. Setup CI/CD Pipeline 🔄

Now let's set up the CI/CD pipeline for the order-service provider to run verification tests. This ensures that verification tests run automatically on every push and pull request.

**Important**: Make sure to add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `PACT_BROKER_URL`: Your Pact Broker URL (e.g., `https://your-org.pactflow.io`)
- `PACT_BROKER_TOKEN`: Your Pact Broker API token (keep it secret, keep it safe! 🔐)

Create a GitHub Actions workflow file:

```yaml:.github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build and Test (includes provider verification)
        run: ./mvnw verify
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}
```

This pipeline will:

1. **Run verification tests**: Execute the provider verification tests created in [Section 3](#3-implement-order-service-verifier-)
2. **Fetch contracts**: Automatically fetch contracts from the Pact Broker for verification
3. **Publish verification results**: Automatically publish verification results back to the Pact Broker (configured via `pact.verifier.publishResults=true` in `application.yml`)

### Step 6: Setup Webhook-Triggered Verification Workflow 🔔

For a more advanced setup, you can create a workflow that triggers verification when contracts are published to the Pact Broker. This allows the provider to automatically verify contracts whenever a consumer publishes a new version.

Create a separate workflow file that listens for webhook events from the Pact Broker:

```yaml:.github/workflows/pact-verification-trigger.yml
name: Pact Provider Verification

on:
  repository_dispatch:
    types: [pact-verification]

permissions:
  checks: write
  contents: read

jobs:
  verify-pact:
    runs-on: ubuntu-latest

    env:
      PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
      PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Display webhook payload
        run: |
          echo "Webhook payload: ${{ toJSON(github.event.client_payload) }}"
          echo "Event type: ${{ github.event.action }}"

      - name: Verify Pact
        run: ./mvnw clean test -Dtest=OrderServiceContractTest
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}

      - name: Test Report
        uses: dorny/test-reporter@v1
        if: success() || failure()
        with:
          name: Pact Verification Tests
          path: target/surefire-reports/*.xml
          reporter: java-junit
          fail-on-error: true
```

**To enable webhook triggers:**

1. In your Pact Broker (or PactFlow), configure a webhook that sends a `repository_dispatch` event to your GitHub repository
2. Set the event type to `pact-verification`
3. Configure the webhook to trigger when contracts are published or updated

This workflow will automatically run verification tests whenever a consumer publishes a new contract, ensuring your provider stays in sync with consumer expectations.

## 4. Publish Contract between order-service and inventory-service 🔗

Now let's do the same thing for the backend services! This time we're working with Kotlin, but the concept is the same - convert your existing mocks to generate contracts.

![Spiderman Pointing Meme](https://cdn-useast1.kapwing.com/static/templates/spider-man-triple-meme-template-regular-1771a302.webp)

> **🤖 AI Agent Prompt**: Want to automate this migration? Use the [AGENTS_CONSUMER.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_CONSUMER.md) prompt with your AI coding assistant (Copilot, Cursor, etc.) to automatically convert your existing MockK mocks to generate Pact consumer contracts. The agent will handle the entire migration process for JVM-based backend services!

> **Reference Implementation**: See the complete working example in [order-service-pact-mock-demo](https://github.com/ludorival/order-service-pact-mock-demo/pull/14)

### Step 1: Install Dependencies 📦

Add `pact-jvm-mock` dependencies to your `pom.xml`:

**Maven (pom.xml):**

```xml
<!-- For MockK -->
<dependency>
    <groupId>io.github.ludorival</groupId>
    <artifactId>pact-jvm-mock-mockk</artifactId>
    <version>1.4.0</version>
    <scope>test</scope>
</dependency>

<!-- For Spring RestTemplate support -->
<dependency>
    <groupId>io.github.ludorival</groupId>
    <artifactId>pact-jvm-mock-spring</artifactId>
    <version>1.4.0</version>
    <scope>test</scope>
</dependency>
```

### Step 2: Configure Pact ⚙️

Time to configure Pact! Create a `PactConfiguration` object to define your consumer and provider names:

```kotlin:src/test/kotlin/com/example/orderservice/pact/InventoryServicePactConfig.kt
import io.github.ludorival.pactjvm.mock.PactConfiguration
import io.github.ludorival.pactjvm.mock.spring.SpringRestTemplateMockAdapter

object InventoryServicePactConfig : PactConfiguration(
    "inventory-service",  // Provider name
    SpringRestTemplateMockAdapter { providerName ->
        // Optional: Custom ObjectMapper configuration
        // Jackson2ObjectMapperBuilder().build()
    }
)
```

**Note**: The consumer name is typically inferred from your project name or can be configured via system properties. Check the [pact-jvm-mock documentation](https://github.com/ludorival/pact-jvm-mock) for consumer name configuration options.

### Step 3: Convert Existing MockK Tests 🔄

Here's the fun part! `pact-jvm-mock` works with existing MockK mocks. Here's how to convert your existing tests (spoiler: it's easier than you think):

**Before (Existing Test with MockK):**

```kotlin:src/test/kotlin/com/example/orderservice/service/InventoryClientTest.kt
import io.mockk.every
import io.mockk.mockk
import org.springframework.http.ResponseEntity
import org.junit.jupiter.api.Test

class InventoryClientTest {

    private val restTemplate = mockk<RestTemplate>()
    private val inventoryClient = InventoryClient(restTemplate)

    @Test
    fun `should check product availability`() {
        val productId = "12345"
        val expectedResponse = ProductAvailability(productId, 42)

        every {
            restTemplate.getForEntity(
                "http://inventory-service/inventory/products/$productId",
                ProductAvailability::class.java
            )
        } returns ResponseEntity.ok(expectedResponse)

        val result = inventoryClient.checkAvailability(productId)

        assertThat(result.quantity).isEqualTo(42)
    }
}
```

**After (With Pact Contract Generation using MockK):**

```kotlin:src/test/kotlin/com/example/orderservice/service/InventoryClientTest.kt
import io.github.ludorival.pactjvm.mock.mockk.EnablePactMock
import io.github.ludorival.pactjvm.mock.mockk.uponReceiving
import io.mockk.mockk
import org.springframework.http.ResponseEntity
import org.junit.jupiter.api.Test

@EnablePactMock(InventoryServicePactConfig::class)
class InventoryClientTest {

    private val restTemplate = mockk<RestTemplate>()
    private val inventoryClient = InventoryClient(restTemplate)

    @Test
    fun `should check product availability`() {
        val productId = "12345"
        val expectedResponse = ProductAvailability(productId, 42)

        uponReceiving {
            restTemplate.getForEntity(any<String>(), ProductAvailability::class.java)
        } returns ResponseEntity.ok(expectedResponse)

        val result = inventoryClient.checkAvailability(productId)

        assertThat(result.quantity).isEqualTo(42)
    }
}
```

### Step 4: Customize Descriptions and Provider States

You can customize the interaction description and add provider states:

```kotlin
uponReceiving {
    restTemplate.getForEntity(any<String>(), ProductAvailability::class.java)
} withDescription { "get product availability by product ID" } given {
    state("product exists in inventory")
} returns ResponseEntity.ok(expectedResponse)
```

> For more advanced features like custom ObjectMapper, matching rules, and error handling, refer to the [pact-jvm-mock documentation](https://github.com/ludorival/pact-jvm-mock). There's always more to learn! 📚

### Step 5: Run Tests and Generate Contracts 🏃

Time to see the magic happen! When you run your tests, Pact contracts will be automatically generated (no extra steps needed):

```bash
./mvnw test
```

After running tests, you'll find the generated Pact contract files in `src/test/resources/pacts/` (e.g., `order-service-inventory-service.json`). The contracts are created automatically based on the interactions recorded during your test execution.

### Step 6: Publish Contracts to Pact Broker 📤

Now let's share our contracts with the Pact Broker! To publish them, add the Pact Maven plugin to your `pom.xml`:

```xml:pom.xml
<plugin>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>maven</artifactId>
    <version>4.6.4</version>
    <configuration>
        <pactBrokerUrl>${PACT_BROKER_URL}</pactBrokerUrl>
        <pactBrokerToken>${PACT_BROKER_TOKEN}</pactBrokerToken>
        <projectVersion>${GIT_COMMIT}</projectVersion>
        <pactDirectory>${project.build.directory}/pacts</pactDirectory>
    </configuration>
</plugin>
```

After running tests and generating contracts, publish them to the Pact Broker:

```bash
./mvnw pact:publish
```

Check your Pact Broker - you should see your contract there! 🎊

### Step 7: Setup CI/CD Pipeline for Backend Provider Verification 🔄

Now let's set up the CI/CD pipeline for the order-service consumer. This pipeline will run tests, generate contracts, publish them to the Pact Broker, and check deployment readiness.

**Important**: Make sure to add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `PACT_BROKER_URL`: Your Pact Broker URL (e.g., `https://your-org.pactflow.io`)
- `PACT_BROKER_TOKEN`: Your Pact Broker API token (keep it secret, keep it safe! 🔐)

Create a GitHub Actions workflow file:

```yaml:.github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-and-publish:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven

      - name: Run tests and generate contracts
        run: ./mvnw test
        env:
          GIT_COMMIT: ${{ github.sha }}

      - name: Publish contracts to Pact Broker
        run: ./mvnw pact:publish
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}

      - name: Check if deployment is safe
        uses: pact-foundation/action-can-i-deploy@v1
        with:
          broker_base_url: ${{ secrets.PACT_BROKER_URL }}
          broker_token: ${{ secrets.PACT_BROKER_TOKEN }}
          pacticipant: order-service
          version: ${{ github.sha }}
```

This pipeline will:

1. **Run tests**: Execute tests which generate Pact contracts
2. **Publish contracts**: Upload generated contracts to the Pact Broker
3. **Check deployment readiness**: Verify that all contracts are verified before allowing deployment

> **💡 Note**: The `can-i-deploy` step will fail on the first run until the provider (inventory-service) implements and merges verification tests. This is expected behavior! See the note in [Step 8](#step-8-check-deployment-readiness-with-can-i-deploy-) for details on making `can-i-deploy` pass.

## 5. Implement Inventory Service Verifier ✅

Follow the same steps as in [Section 3: Implement Order Service Verifier](#3-implement-order-service-verifier-), but with the following differences for the inventory-service:

![Developer Meme](https://pbs.twimg.com/media/E8_bAqIWQAglLMy?format=jpg&name=small)

> **🤖 AI Agent Prompt**: Want to automate provider verification setup? Use the [AGENTS_PROVIDER_VERIFICATION.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_PROVIDER_VERIFICATION.md) prompt with your AI coding assistant to automatically create provider verification tests, configure Pact Broker integration, and update your CI/CD pipeline. The agent will handle the entire setup process for you!

> **Reference Implementation**: See the complete working example in [inventory-service-pact-mock-demo](https://github.com/ludorival/inventory-service-pact-mock-demo/pull/4)

**Key differences:**

- **Step 1**: Copy the contract file `order-service-inventory-service.json` from the order-service project
- **Step 3 & 4**: Use `@Provider("inventory-service")` and class name `InventoryServiceContractTest` in package `com.example.inventoryservice.pact`
- **Step 5**: The CI/CD pipeline is the same (providers only run verification tests

## 8. Test a Breaking Change from Frontend 💥

Time to break things (on purpose, of course)! Let's simulate a breaking change in the frontend by modifying the expected response structure. This is where contract testing really shines - it catches these issues before they hit production:

```typescript:src/App.cy.tsx
  beforeEach(() => {
    cy.pactIntercept('GET', `v1/items`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Test Item 1',
          description: 'This is a test item',
          stock: 5, // Changed from stockCount to stock (BREAKING CHANGE)
        },
      ],
    }).as('getItems')
  })
```

When you run tests and publish the new contract, the order-service's contract verification will fail because:

1. The new contract expects a `stock` field (but wait, there's more...)
2. The order-service still returns `stockCount` (oops! 😬)
3. The Pact verifier detects this mismatch and fails the build (caught red-handed!)

This prevents deploying incompatible changes to production! Your CI/CD pipeline just saved you from a production incident. You're welcome! 🎉

## 9. Test a Breaking Change from Order Service 💥

Let's do it again, but this time from the other direction! Similarly, let's simulate a breaking change in the order-service's contract with inventory-service (breaking things is fun when it's intentional!):

```kotlin:src/test/kotlin/com/example/orderservice/service/InventoryClientTest.kt
@EnablePactMock(InventoryServicePactConfig::class)
class InventoryClientTest {
    // ... existing setup ...

    @Test
    fun `should check product availability`() {
        val productId = "12345"
        val expectedResponse = ProductAvailability(productId, stock = 42) // Changed from quantity to stock (BREAKING CHANGE)

        uponReceiving {
            restTemplate.getForEntity(any<String>(), ProductAvailability::class.java)
        } returns ResponseEntity.ok(expectedResponse)

        val result = inventoryClient.checkAvailability(productId)

        assertThat(result.stock).isEqualTo(42) // Updated assertion
    }
}
```

When the order-service publishes this new contract, the inventory-service's contract verification will fail because:

1. The new contract expects a `stock` field in the response (expecting one thing...)
2. The inventory-service still returns `quantity` (but getting another!)
3. The Pact verifier detects this mismatch and fails the build (busted! 🚨)

This ensures that breaking changes are caught early in the development cycle (before your users notice, which is always a good thing!).

## 10. Conclusion 🎊

![Success Kid Meme - Added Contract Testing](https://media.makeameme.org/created/added-contract-testing.jpg)

Congratulations! You made it to the end! 🎉 By leveraging existing mocks in our tests, we've successfully implemented contract testing with Pact without rewriting our test suite. This approach offers several key benefits:

1. **Zero additional test code**: Existing tests automatically become contract tests (more value, less work!)
2. **Single source of truth**: Mocks are defined once, contracts generated automatically (DRY principle, achieved!)
3. **Gradual adoption**: Teams can start with existing tests and expand coverage over time (no big bang migration needed)
4. **Developer-friendly**: No need to learn Pact DSL; use familiar mocking libraries (use what you know!)
5. **AI-assisted**: Modern AI agents can help accelerate the conversion process (the future is now! 🤖)

### Key Takeaways 📝

Here's what you should remember (the TL;DR version):

- **Frontend**: Use `pact-js-mock` with `cy.pactIntercept()` to convert Cypress mocks (just swap the method name!)
- **Backend**: Use `pact-jvm-mock` with `@EnablePactMock` annotation and `uponReceiving()` to convert Mockito/MockK tests with Spring RestTemplate (annotate and go!)
- **Provider Verification**: Use standard Pact JVM provider verification for Spring Boot applications (prove you're keeping your promises)
- **CI/CD**: Integrate contract publishing and verification into your pipeline (automate all the things!)
- **Breaking Changes**: Contract testing catches incompatible changes before deployment (safety net activated! 🛡️)

### Next Steps 🚀

Ready to implement this in your own projects? Here's your roadmap:

1. Start with your existing test mocks and convert them incrementally (baby steps, you've got this!)
2. Set up Pact Broker (or use PactFlow) for contract management (choose your adventure)
3. Integrate contract verification into your CI/CD pipeline (automation is your friend)
4. Use AI agents to accelerate the conversion process (let the robots help!)
5. Monitor contract compatibility across service boundaries (keep an eye on things 👀)

Remember: you don't have to do everything at once. Start small, iterate, and expand as you get comfortable!

### Reference Implementations 📚

Need to see it in action? Complete working examples with pull requests are available on GitHub (no fake code here!):

- **[shop-pact-mock-frontend - PR #10](https://github.com/ludorival/shop-pact-mock-frontend/pull/10)**: Frontend React application demonstrating Cypress tests with `pact-js-mock` (converts `cy.intercept()` to `cy.pactIntercept()` for contract generation)
- **[order-service-pact-mock-demo - PR #14](https://github.com/ludorival/order-service-pact-mock-demo/pull/14)**: Spring Boot service demonstrating MockK tests with `pact-jvm-mock` (converts existing mocks to generate consumer contracts)
- **[order-service-pact-mock-demo - PR #13](https://github.com/ludorival/order-service-pact-mock-demo/pull/13)**: Spring Boot service demonstrating provider verification tests with Pact Broker integration (verifies contracts from Pact Broker for order-service)
- **[inventory-service-pact-mock-demo - PR #4](https://github.com/ludorival/inventory-service-pact-mock-demo/pull/4)**: Spring Boot service demonstrating provider verification tests (verifies contracts from Pact Broker for inventory-service)

These pull requests provide:

- Complete, runnable code examples (copy-paste ready!)
- Working test suites (they actually work, we promise!)
- CI/CD pipeline configurations (automation included!)
- Pact contract generation and publishing (the whole package!)
- Step-by-step migration examples (see exactly how it's done!)

Go ahead, review the pull requests, clone them, run them, break them, fix them - that's how you learn! 💪

### Additional Resources 📖

Want to dive deeper? For more details on each step, refer to:

- [pact-js-mock documentation](https://github.com/ludorival/pact-js-mock) (frontend magic)
- [pact-jvm-mock documentation](https://github.com/ludorival/pact-jvm-mock) (backend wizardry)
- [Official Pact documentation](https://docs.pact.io/) (the source of truth)

Happy contract testing! May your contracts be strong and your deployments be safe! 🎉✨
