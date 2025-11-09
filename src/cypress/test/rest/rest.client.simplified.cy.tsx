/**
 * Example test using the NEW simplified Cypress integration API
 * 
 * This demonstrates:
 * 1. Single import for auto-setup
 * 2. No lifecycle hooks needed (automatically handled)
 * 3. Simplified cy.pactIntercept() command
 * 4. Automatic pact registration
 */

import 'pact-js-mock/lib/cypress' // Auto-setup: registers commands and lifecycle hooks
import { mount } from '@cypress/react'
import * as props from '../../../test/rest.client'
import CreateTodo from '../CreateTodo'
import TodoDetails from '../TodoDetails'
import TodoList from '../TodoList'
import { pact } from './handlers'
import { omitVersion } from '../../../test/utils'

// Register the pact instance (only needed once per test file)
// Lifecycle hooks (before, beforeEach, after) are automatically handled
cy.registerPact(pact)

describe('To-Do list Rest API client (Simplified API)', () => {
  describe('fetchTodos', () => {
    it('should fetch all To-Do items', () => {
      // NEW: Simplified cy.pactIntercept() instead of cy.intercept() + pact.toHandler()
      cy.pactIntercept('GET', `/api/todos?all=true`, {
        description: 'get multiple todos',
        response: {
          status: 200,
          body: [
            {
              id: '1',
              title: 'Buy groceries',
              description: 'Milk, bread, eggs, cheese',
              completed: false,
            },
            {
              id: '2',
              title: 'Do laundry',
              description: '',
              completed: true,
            },
            {
              id: '3',
              title: 'Call plumber',
              description: 'Fix leaky faucet in the bathroom',
              completed: false,
            },
          ],
        },
      }).as('multipleTodos')

      mount(<TodoList {...props} />)

      cy.wait('@multipleTodos')
        .its('response')
        .its('statusCode')
        .should('be.equal', 200)
    })

    it('should get a technical failure the first time and an empty todo list', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })

      // First request: technical failure
      cy.pactIntercept('GET', '/api/todos?all=true', {
        providerState: 'will return a 500 http error',
        description: 'rest api returns a 500 http error',
        response: {
          status: 500,
        },
      }).as('todosWillRaiseTechnicalFailure')

      mount(<TodoList {...props} />)

      cy.wait('@todosWillRaiseTechnicalFailure')
        .its('response')
        .its('statusCode')
        .should('be.equal', 500)

      // Second request: empty list
      cy.pactIntercept('GET', '/api/todos?all=true', {
        description: 'empty todo list',
        response: {
          status: 200,
          body: [],
        },
      }).as('emptyTodos')

      cy.get('#reload').click()

      cy.wait('@emptyTodos').its('response.body').should('have.length', 0)
    })
  })

  describe('createTodo', () => {
    it('should create a new To-Do item', () => {
      // NEW: Direct interaction definition in cy.pactIntercept()
      cy.pactIntercept('POST', '/api/todos', {
        description: 'should create a Todo with success',
        response: {
          status: 201,
          body: {
            id: '1',
            title: 'Buy groceries',
            description: 'Milk, bread, eggs, cheese',
            completed: false,
          },
        },
      }).as('createTodoWillSucceed')

      mount(<CreateTodo {...props} />)
      cy.get('#title')
        .type('Go to groceries')
        .get('#description')
        .type('- Banana, Apple')
        .get('#submit')
        .click()

      cy.wait('@createTodoWillSucceed')
        .its('response')
        .its('statusCode')
        .should('be.equal', 201)
    })
  })

  describe('todoById', () => {
    it('should get a todo by its id', () => {
      cy.pactIntercept('GET', '/api/todos/*', {
        description: 'should found a todo item by its id',
        providerState: 'there is an existing todo item with this id',
        response: {
          status: 200,
          body: {
            id: '1',
            title: 'Buy groceries',
            description: 'Milk, bread, eggs, cheese',
            completed: false,
          },
        },
      }).as('todoByIdFound')

      mount(<TodoDetails id="1" {...props} />)

      cy.wait('@todoByIdFound')
        .its('response')
        .its('statusCode')
        .should('be.equal', 200)
    })

    it('should get an error when getting a todo does not found it', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })

      cy.pactIntercept('GET', '/api/todos/*', {
        description: 'should not found a todo item by its id',
        response: {
          status: 404,
          body: { message: 'The todo item 1 is not found' },
        },
      }).as('todoByIdNotFound')

      mount(<TodoDetails id="1" {...props} />)

      cy.wait('@todoByIdNotFound')
        .its('response')
        .its('statusCode')
        .should('be.equal', 404)
    })
  })

  it('the generated pact file should match with the snapshot', () => {
    const pactFile = pact.generatePactFile()
    cy.fixture('test-consumer-rest-provider.json').then((expectedPact) => {
      expect(omitVersion(pactFile)).to.deep.equal(
        omitVersion(expectedPact, false),
      )
    })
  })
})
