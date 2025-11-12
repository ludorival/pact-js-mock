# How to implement Contract Test with Pact by leveraging existing mocks

> **🚀 Quick Start**: Want to jump straight to implementation? [Use AI to generate your contract tests](#-quick-start-use-ai-to-generate-your-contract-tests) - No need to read the full tutorial!

## Motivation: Why Leverage Existing Mocks? 🤔

### The Problem with Traditional Contract Testing

Contract testing with Pact is a powerful technique for ensuring compatibility between services in a microservices architecture. However, it often comes with a significant challenge: **developers need to write additional tests** to generate consumer contracts. And let's be honest, who has time for that? 😅

Consider the typical workflow (and why it's a bit of a pain):

1. Developers write integration tests using mocks (e.g., `cy.intercept()` in Cypress, Mockito/MockK in Java/Kotlin, MSW in React)
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
3. **Gradual adoption**: Start with existing tests, expand coverage over time (no need to rewrite everything at once)
4. **Developer-friendly**: No need to learn Pact DSL; use familiar mocking libraries (use what you already know!)
5. **Reduced maintenance**: Changes to mocks automatically update contracts (one less thing to worry about)

### How It Works 🛠️

By using libraries like [`pact-js-mock`](https://github.com/ludorival/pact-js-mock) for frontend applications and [`pact-jvm-mock`](https://github.com/ludorival/pact-jvm-mock) for JVM-based backends, we can:

- **Frontend**: Convert Cypress `cy.intercept()` calls or MSW handlers `http.get()` into Pact contracts (just swap a few method names!)
- **Backend**: Convert Mockito or MockK mocks (with Spring RestTemplate) into Pact contracts (your existing tests are already 90% there!)

This tutorial demonstrates how to transform your existing test mocks into comprehensive Pact contracts with minimal changes to your codebase.

---

## 🚀 Quick Start: Use AI to Generate Your Contract Tests

> **For developers who want to jump straight to implementation**: Use the AI prompts below with GitHub Copilot, Cursor, or other AI coding assistants to automatically convert your existing mocks into Pact contracts. Skip to the detailed steps later if you need more context.

### AI Prompt for Frontend Contract Tests

**Use this prompt in your AI agent (Copilot, Cursor, etc.) to automatically detect your stack and convert existing mocks to Pact contracts:**

We've created detailed prompts that handle the conversion process for you. Instead of embedding the entire prompts here, check out the specific documentation for your testing framework:

- **For Cypress tests**: Use the [AGENTS_CYPRESS.md documentation](https://github.com/ludorival/pact-js-mock/blob/main/docs/AGENTS_CYPRESS.md) - perfect if you're using `cy.intercept()` in your Cypress tests (just swap it for `cy.pactIntercept()` and you're golden! ✨)

- **For MSW (Mock Service Worker) tests**: Use the [AGENTS_MSW.md documentation](https://github.com/ludorival/pact-js-mock/blob/main/docs/AGENTS_MSW.md) - ideal if you're using MSW handlers in your Jest, Vitest, or Mocha tests (just change the import and you're done! 🎯)

Both documentation files include step-by-step instructions, code examples, and best practices to help your AI assistant migrate your existing mocks to generate Pact contracts without modifying your test logic. Pick the one that matches your stack and let the AI do the heavy lifting!

### AI Prompt for Backend Contract Tests (JVM)

**Use this prompt in your AI agent to automatically detect your stack and convert existing mocks to Pact contracts:**

We've created a comprehensive prompt that handles the entire conversion process for JVM-based backend services. Instead of embedding the entire prompt here, check out the [AGENTS_CONSUMER.md documentation](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_CONSUMER.md) in the pact-jvm-mock repository.

This documentation will guide your AI assistant to:

- Analyze your codebase (Maven/Gradle, Mockito/MockK, Java/Kotlin, etc.)
- Convert your existing mocks to generate Pact consumer contracts (just annotate and swap a few method calls!)
- Set up contract publishing to the Pact Broker
- Update your CI/CD pipeline automatically

The prompt includes everything needed to transform your Mockito or MockK tests into contract-generating powerhouses - all while keeping your existing test logic intact. Your tests won't even notice the difference (but your contracts will! 📝)

### AI Prompt for Provider Verification Tests (JVM)

**Use this prompt to create Pact provider verification tests and update CI/CD pipeline:**

Ready to prove your service keeps its promises? We've got you covered! Check out the [AGENTS_PROVIDER_VERIFICATION.md documentation](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_PROVIDER_VERIFICATION.md) in the pact-jvm-mock repository.

This comprehensive prompt will guide your AI assistant to:

- Analyze your JVM application (Spring Boot, Micronaut, Quarkus, etc.)
- Create provider verification tests that fetch contracts from the Pact Broker (no manual setup needed!)
- Configure your application to run against the verification tests
- Publish verification results back to the broker (sharing is caring! 📤)
- Update your CI/CD pipeline to run verification automatically

The prompt handles all the nitty-gritty details like dependencies, annotations, and configuration - so you can focus on building features while your contracts keep everything in check. It's like having a contract watchdog that never sleeps! 🐕

### Benefits of Using AI Agents 🤖

Using AI agents with these prompts provides several advantages (because who doesn't love a good coding assistant?):

1. **Faster onboarding**: New team members can quickly understand and implement contract testing (no more "how do I do this again?" moments)
2. **Consistent patterns**: AI agents help maintain consistent test structure across the codebase (consistency is key, after all!)
3. **Reduced errors**: AI agents can catch common mistakes and suggest best practices

**Note**: Always review AI-generated code and ensure it matches your project's standards and requirements. AI is smart, but you're smarter! 🧠

---

## Let's get started! 🎉

In this tutorial, we'll explore how to implement contract testing using Pact in a microservices architecture. Our example consists of three components (think of them as our test subjects):

- [`shop-frontend`](https://github.com/ludorival/shop-pact-mock-frontend): A web application with Cypress tests (the pretty face of our shop)
- [`order-service`](https://github.com/ludorival/order-service-pact-mock-demo): A Springboot application handling orders written in Kotlin and using MockK for mocking (the brain that processes orders)
- [`inventory-service`](https://github.com/ludorival/inventory-service-pact-mock-demo): Another Springboot application managing inventory written in Kotlin and also using MockK (the warehouse keeper)

These repositories will serve as the base code for this tutorial. We'll build step-by-step instructions on top of them, illustrating how to implement contract testing in real applications. No fake examples here - just real, working code! 💪

Before we dive into the architecture, let's see what we're building! Here's our shop-frontend in action:

![Shop Frontend Demo](./new%20amazon.gif)

_Okay, okay, it's not about to replace Amazon, but you get the idea, right?_ 😄🛒 As you can see, it's a simple e-commerce interface where users can browse products, add items to their cart, and place orders. Pretty standard stuff, but perfect for demonstrating contract testing in action!

Now, let's talk architecture. Our microservices setup follows a simple request flow:

```mermaid
graph LR
    A[shop-frontend] --> B[order-service]
    B --> C[inventory-service]
```

Here's how it works: when a user interacts with the `shop-frontend` (like adding an item to cart or placing an order), it makes API calls to the `order-service`. The `order-service` then communicates with the `inventory-service` to check stock availability and update inventory levels. Each service has its own responsibilities, and they need to communicate seamlessly - which is exactly where contract testing comes in! 🎯

## Prerequisites 📋

Before we dive in, make sure you have:

- Node.js installed
- Basic understanding of React and TypeScript
- Docker for running Pact Broker (or use PactFlow if you prefer the managed route)

## 1. Deploy Pact Broker 🚀

First things first - we need somewhere to store our contracts! You have two options :

### Option A: Using PactFlow (Managed Service) ☁️

The easy way :

1. Create an account on [PactFlow](https://pactflow.io/) (it's free to start!)
2. Get your API token
3. Set environment variables:

```bash
export PACT_BROKER_BASE_URL=https://your-org.pactflow.io
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

> **🤖 AI Agent Prompt**: Want to automate this migration? Use the [AGENTS_CYPRESS.md](./AGENTS_CYPRESS.md) prompt with your AI coding assistant (Copilot, Cursor, etc.) to automatically convert your existing `cy.intercept()` calls to `cy.pactIntercept()` and generate Pact contracts. The agent will handle the entire migration process for you!

> **Reference Implementation**: See the complete working example in [shop-pact-mock-frontend](https://github.com/ludorival/shop-pact-mock-frontend/pull/10)

Alright, time for the fun part! Let's make our frontend generate contracts. This is where the magic happens ✨

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
      return pactPlugin(on, config, {
        consumerName: 'shop-frontend',
        pactVersion: '4.0.0',
      });
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
    "pact:publish": "pact-broker publish ./pacts --broker-base-url=$PACT_BROKER_BASE_URL --broker-token=$PACT_BROKER_TOKEN --consumer-app-version=$GIT_COMMIT",
    "pact:can-i-deploy": "pact-broker can-i-deploy --broker-base-url=$PACT_BROKER_BASE_URL --broker-token=$PACT_BROKER_TOKEN --pacticipant=shop-frontend --version=$GIT_COMMIT"
  }
}
```

After running tests and generating contracts, publish them to the Pact Broker:

```bash
npm run pact:publish
```

Check your Pact Broker - you should see your contract there! 🎊

## 3. Implement Order Service Verifier ✅

> **🤖 AI Agent Prompt**: Want to automate provider verification setup? Use the [AGENTS_PROVIDER_VERIFICATION.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_PROVIDER_VERIFICATION.md) prompt with your AI coding assistant to automatically create provider verification tests, configure Pact Broker integration, and update your CI/CD pipeline. The agent will handle the entire setup process for you!

Now let's make sure the order-service actually fulfills the contract. In the order-service project, create a Pact provider verification test. First, add the necessary dependencies:

> **💡 Tip: Testing Locally Before Pact Broker**
>
> Before setting up the Pact Broker, you can test locally by sharing the pact file directly:
>
> - Pact files are generated at `./pacts/<consumer-name>-<provider-name>.json` (e.g., `./pacts/shop-frontend-order-service.json`)
> - Share this file with the provider team for local verification
> - The provider can use `@PactFolder` annotation to load contracts from a local directory
> - Once local testing is successful, move to Pact Broker for CI/CD integration

**Maven (pom.xml):**

```xml
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

**Gradle (build.gradle.kts):**

```kotlin
testImplementation("au.com.dius.pact.provider:junit5:4.6.4")
testImplementation("au.com.dius.pact.provider:spring:4.6.4")
```

Create a provider verification test:

**Option 1: Using Pact Broker (for CI/CD):**

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
    url = "\${PACT_BROKER_BASE_URL}",
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

**Option 2: Using Local Pact Files (for local testing):**

If you want to test locally before setting up the Pact Broker, use `@PactFolder` instead:

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

> **Note:** Place the pact file (e.g., `shop-frontend-order-service.json`) in the `pacts` directory of the provider project. You can get this file from the consumer project's `./pacts/` directory after running tests.

Create a `src/test/resources/application.properties` file:

```properties:src/test/resources/application.properties
pact.verifier.publishResults=true
pact.provider.version=${GIT_COMMIT:local}
```

This test will:

1. Start your Spring Boot application
2. Fetch contracts from the Pact Broker (getting the contracts...)
3. Verify that your application satisfies all consumer contracts (checking if you're keeping your promises)
4. Publish verification results back to the broker (sharing the good news - or bad news, if something's broken 😅)

## 4. Setup CI/CD Pipeline 🔄

Time to automate everything (because manual work is so last decade)! Update your CI/CD pipeline to run tests and publish contracts. Here's a complete GitHub Actions workflow (copy-paste friendly):

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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          GIT_COMMIT: ${{ github.sha }}

      - name: Publish Pact contracts
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: npm run pact:publish
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}

      - name: Check if can deploy
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: npm run pact:can-i-deploy
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}
```

**Important**: Make sure to add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `PACT_BROKER_BASE_URL`: Your Pact Broker URL (e.g., `https://your-org.pactflow.io`)
- `PACT_BROKER_TOKEN`: Your Pact Broker API token (keep it secret, keep it safe! 🔐)

This ensures that:

1. Tests run on every push and pull request
2. Contracts are published to the broker after successful tests on main branch
3. Deployment is blocked if contracts are incompatible with provider services

## 5. Publish Contract between order-service and inventory-service 🔗

> **🤖 AI Agent Prompt**: Want to automate this migration? Use the [AGENTS_CONSUMER.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_CONSUMER.md) prompt with your AI coding assistant (Copilot, Cursor, etc.) to automatically convert your existing MockK or Mockito mocks to generate Pact consumer contracts. The agent will handle the entire migration process for JVM-based backend services!

> **Reference Implementation**: See the complete working example in [order-service-pact-mock-demo](https://github.com/ludorival/order-service-pact-mock-demo/pull/14)

Now let's do the same thing for the backend services! This time we're working with Kotlin/Java, but the concept is the same - convert your existing mocks to generate contracts.

### Step 1: Install Dependencies 📦

Add `pact-jvm-mock` dependencies to your `build.gradle.kts` or `pom.xml`. The library supports both MockK and Mockito (pick your favorite, we don't judge!):

**Gradle (build.gradle.kts):**

```kotlin
// For MockK
testImplementation("io.github.ludorival:pact-jvm-mock-mockk:1.4.0")

// OR for Mockito
testImplementation("io.github.ludorival:pact-jvm-mock-mockito:1.4.0")

// For Spring RestTemplate support
testImplementation("io.github.ludorival:pact-jvm-mock-spring:1.4.0")
```

**Maven (pom.xml):**

```xml
<!-- For MockK -->
<dependency>
    <groupId>io.github.ludorival</groupId>
    <artifactId>pact-jvm-mock-mockk</artifactId>
    <version>1.4.0</version>
    <scope>test</scope>
</dependency>

<!-- OR for Mockito -->
<dependency>
    <groupId>io.github.ludorival</groupId>
    <artifactId>pact-jvm-mock-mockito</artifactId>
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

Time to configure Pact! Create a `PactConfiguration` object to define your consumer and provider names. This is typically done as a Kotlin object or Java class:

**Kotlin:**

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

**Java:**

```java:src/test/java/com/example/orderservice/pact/InventoryServicePactConfig.java
import io.github.ludorival.pactjvm.mock.PactConfiguration;
import io.github.ludorival.pactjvm.mock.spring.SpringRestTemplateMockAdapter;

public class InventoryServicePactConfig extends PactConfiguration {
    public InventoryServicePactConfig() {
        super("inventory-service", new SpringRestTemplateMockAdapter());
    }
}
```

### Step 3: Convert Existing Mockito/MockK Tests 🔄

Here's the fun part! `pact-jvm-mock` works with existing Mockito or MockK mocks. Here's how to convert your existing tests (spoiler: it's easier than you think):

**Before (Existing Test with Mockito):**

```kotlin:src/test/kotlin/com/example/orderservice/service/InventoryClientTest.kt
@ExtendWith(MockitoExtension::class)
class InventoryClientTest {

    @Mock
    lateinit var restTemplate: RestTemplate

    @InjectMocks
    lateinit var inventoryClient: InventoryClient

    @Test
    fun `should check product availability`() {
        val productId = "12345"
        val expectedResponse = ProductAvailability(productId, 42)

        `when`(restTemplate.getForEntity(
            eq("http://inventory-service/inventory/products/$productId"),
            eq(ProductAvailability::class.java)
        )).thenReturn(ResponseEntity.ok(expectedResponse))

        val result = inventoryClient.checkAvailability(productId)

        assertThat(result.quantity).isEqualTo(42)
    }
}
```

**After (With Pact Contract Generation using Mockito):**

```kotlin:src/test/kotlin/com/example/orderservice/service/InventoryClientTest.kt
import io.github.ludorival.pactjvm.mock.mockito.EnablePactMock
import io.github.ludorival.pactjvm.mock.mockito.PactMockito.uponReceiving
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.eq
import org.springframework.http.ResponseEntity
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.Mock
import org.mockito.InjectMocks

@ExtendWith(MockitoExtension::class)
@EnablePactMock(InventoryServicePactConfig::class)
class InventoryClientTest {

    @Mock
    lateinit var restTemplate: RestTemplate

    @InjectMocks
    lateinit var inventoryClient: InventoryClient

    @Test
    fun `should check product availability`() {
        val productId = "12345"
        val expectedResponse = ProductAvailability(productId, 42)

        uponReceiving(
            restTemplate.getForEntity(
                any(String::class.java),
                eq(ProductAvailability::class.java)
            )
        ).thenReturn(ResponseEntity.ok(expectedResponse))

        val result = inventoryClient.checkAvailability(productId)

        assertThat(result.quantity).isEqualTo(42)
    }
}
```

**Alternative: Using MockK (Kotlin DSL):**

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

**Kotlin (MockK):**

```kotlin
uponReceiving {
    restTemplate.getForEntity(any<String>(), ProductAvailability::class.java)
} withDescription { "get product availability by product ID" } given {
    state("product exists in inventory")
} returns ResponseEntity.ok(expectedResponse)
```

**Java (Mockito):**

```java
uponReceiving(restTemplate.getForEntity(any(String.class), eq(ProductAvailability.class)))
    .withDescription("Get product availability by product ID")
    .given(builder -> builder.state("product exists in inventory"))
    .thenReturn(ResponseEntity.ok(expectedResponse));
```

### How It Works 🧙

The `pact-jvm-mock` library is pretty clever:

- Annotate your test class with `@EnablePactMock(PactConfiguration::class)` to enable Pact recording
- Replaces your existing Mockito/MockK mocks with `uponReceiving()` (just swap the method calls!)
- Records all HTTP interactions made through Spring's `RestTemplate` (it's watching... 👀)
- Generates Pact contract files in `src/test/resources/pacts` by default
- Uses the test name as the interaction description (or custom description if provided)
- Maintains your existing test structure - just annotate the class and use `uponReceiving()` instead of `when()`/`every()`

### Key Benefits 🎁

1. **Minimal changes**: Your test logic remains the same (no need to rewrite everything!)
2. **Familiar API**: Uses Mockito/MockK patterns you already know (no learning curve here)
3. **Automatic contract generation**: Contracts are created automatically when tests run (set it and forget it)
4. **Spring integration**: Works seamlessly with Spring's `RestTemplate`

For more advanced features like custom ObjectMapper, matching rules, and error handling, refer to the [pact-jvm-mock documentation](https://github.com/ludorival/pact-jvm-mock). There's always more to learn! 📚

### Step 5: Publish Contracts to Pact Broker 📤

After running your tests, Pact contract files will be generated in `src/test/resources/pacts` . To publish them to the Pact Broker, add a Maven or Gradle task:

**Maven (pom.xml):**

```xml
<plugin>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>maven</artifactId>
    <version>4.6.4</version>
    <configuration>
        <pactBrokerUrl>${PACT_BROKER_BASE_URL}</pactBrokerUrl>
        <pactBrokerToken>${PACT_BROKER_TOKEN}</pactBrokerToken>
        <projectVersion>${GIT_COMMIT}</projectVersion>
        <pactDirectory>${project.build.directory}/pacts</pactDirectory>
    </configuration>
</plugin>
```

**Gradle (build.gradle.kts):**

```kotlin
plugins {
    id("au.com.dius.pact") version "4.6.4"
}

pact {
    publish {
        pactDirectory = "src/test/resources/pacts"
        pactBrokerUrl = System.getenv("PACT_BROKER_BASE_URL") ?: ""
        pactBrokerToken = System.getenv("PACT_BROKER_TOKEN") ?: ""
        consumerVersion = System.getenv("GIT_COMMIT") ?: "local"
    }
}
```

Then publish contracts with:

```bash
# Maven
./mvnw pact:publish

# Gradle
./gradlew pactPublish
```

## 6. Implement Inventory Service Verifier ✅

> **🤖 AI Agent Prompt**: Want to automate provider verification setup? Use the [AGENTS_PROVIDER_VERIFICATION.md](https://github.com/ludorival/pact-jvm-mock/blob/main/docs/AGENTS_PROVIDER_VERIFICATION.md) prompt with your AI coding assistant to automatically create provider verification tests, configure Pact Broker integration, and update your CI/CD pipeline. The agent will handle the entire setup process for you!

> **Reference Implementation**: See the complete working example in [inventory-service-pact-mock-demo](https://github.com/ludorival/inventory-service-pact-mock-demo/pull/4)
> One more time! In the inventory-service project, create a similar Pact provider verification test (you're getting good at this!):

```kotlin:src/test/kotlin/com/example/inventoryservice/pact/InventoryServiceContractTest.kt
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
@Provider("inventory-service")
@PactBroker(
    url = "\${PACT_BROKER_BASE_URL}",
    authentication = PactBrokerAuth(token = "\${PACT_BROKER_TOKEN}")
)
class InventoryServiceContractTest {

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

## 7. Setup CI/CD Pipeline for Backend Services 🔄

Let's automate the backend services too! Update the CI/CD pipeline for both order-service and inventory-service:

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

      - name: Build and Test
        run: ./mvnw verify
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}

      - name: Publish Pact contracts
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          ./mvnw pact:publish
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}

      - name: Can I Deploy?
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          curl -LO https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v1.88.3/pact-1.88.3-linux-x86_64.tar.gz
          tar xzf pact-1.88.3-linux-x86_64.tar.gz
          ./pact/bin/pact-broker can-i-deploy \
            --broker-base-url="${PACT_BROKER_BASE_URL}" \
            --broker-token="${PACT_BROKER_TOKEN}" \
            --pacticipant="${PACTICIPANT}" \
            --version="${GITHUB_SHA}"
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          PACTICIPANT: ${{ github.event.repository.name }}
          GIT_COMMIT: ${{ github.sha }}
```

**Note**: For Maven projects, you may need to add the Pact Maven plugin to publish contracts:

```xml:pom.xml
<plugin>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>maven</artifactId>
    <version>4.6.4</version>
    <configuration>
        <pactBrokerUrl>${PACT_BROKER_BASE_URL}</pactBrokerUrl>
        <pactBrokerToken>${PACT_BROKER_TOKEN}</pactBrokerToken>
        <projectVersion>${GIT_COMMIT}</projectVersion>
    </configuration>
</plugin>
```

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
- **[order-service-pact-mock-demo - PR #14](https://github.com/ludorival/order-service-pact-mock-demo/pull/14)**: Spring Boot service demonstrating MockK/Mockito tests with `pact-jvm-mock` (converts existing mocks to generate consumer contracts)
- **[inventory-service-pact-mock-demo - PR #4](https://github.com/ludorival/inventory-service-pact-mock-demo/pull/4)**: Spring Boot service demonstrating provider verification tests (verifies contracts from Pact Broker)

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
