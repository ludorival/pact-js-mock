import React from 'react'
import { mount } from '@cypress/react'
import * as props from '../../../test/graphql.client'
import CreateTodo from '../CreateTodo'
import TodoDetails from '../TodoDetails'
import TodoList from '../TodoList'
import {
  createTodoWillSucceed,
  emptyTodos,
  multipleTodos,
  pact,
  todoByIdFound,
  todoByIdNotFound,
  todosWillRaiseTechnicalFailure,
} from './handlers'
import { omitVersion } from '../../../test/utils'

// Register the pact instance - lifecycle hooks are handled automatically
cy.registerPact(pact)

describe('To-Do list GraphQL API client', () => {
  describe('fetchTodos', () => {
    it('should fetch all To-Do items', () => {
      // use multipleTodos handlers from contracts
      cy.intercept('POST', `/graphql`, multipleTodos).as('multipleTodos')

      // Mount the TodoList to fetchTodos function and get the actual data
      mount(<TodoList {...props} />)

      // expect the actual data to match the expected data
      cy.wait('@multipleTodos')
        .its('response')
        .its('body')
        .its('data.todos')
        .should('have.length', 3)
    })

    it('should get a technical failure the first time and an empty todo list', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })
      // use todosWillRaiseTechnicalFailure and emptyTodos handlers from contracts
      cy.intercept('POST', `/graphql`, todosWillRaiseTechnicalFailure).as(
        'todosWillRaiseTechnicalFailure',
      )
      // Mount the TodoList to fetchTodos function and get the actual data
      mount(<TodoList {...props} />)

      cy.wait('@todosWillRaiseTechnicalFailure')
        .its('response')
        .its('statusCode')
        .should('be.equal', 500)

      cy.intercept('POST', `/graphql`, emptyTodos).as('emptyTodos')
      // Reload the fetch
      cy.get('#reload').click()

      // expect the actual data to match the expected data
      cy.wait('@emptyTodos')
        .its('response.body.data.todos')
        .should('have.length', 0)
    })
  })

  describe('createTodo', () => {
    it('should create a new To-Do item', () => {
      // use createTodoWillSucceed handlers from contracts
      cy.intercept('POST', `/graphql`, createTodoWillSucceed).as(
        'createTodoWillSucceed',
      )

      // mount the CreateTodo and get the actual data
      mount(<CreateTodo {...props} />)
      cy.get('#title')
        .type('Go to groceries')
        .get('#description')
        .type('- Banana, Apple')
        .get('#submit')
        .click()

      // expect the actual data to match the status code
      cy.wait('@createTodoWillSucceed')
        .its('response')
        .its('body.data')
        .its('createTodo.id')
        .should('be.equal', '1')
    })
  })

  describe('todoById', () => {
    it('should get a todo by its id', () => {
      // use todoByIdFound handlers from contracts
      cy.intercept('POST', `/graphql`, todoByIdFound).as('todoByIdFound')

      // mount the TodoDetails and get the actual data
      mount(<TodoDetails id="1" {...props} />)

      // expect the actual data to match the expected status code
      cy.wait('@todoByIdFound')
        .its('response')
        .its('body.data')
        .its('todoById.id')
        .should('be.equal', '1')
    })

    it('should get an error when getting a todo does not found it', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })
      // use todoByIdFound handlers from contracts
      cy.intercept('POST', `/graphql`, todoByIdNotFound).as('todoByIdNotFound')

      // mount the TodoDetails and get the actual data
      mount(<TodoDetails id="1" {...props} />)

      // expect the actual data to match the expected status code
      cy.wait('@todoByIdNotFound')
        .its('response')
        .its('body.errors')
        .should('deep.equal', [{ message: 'The todo item 1 is not found' }])
    })
  })
  it('the generated pact file should match with the snapshot', () => {
    const pactFile = pact.generatePactFile()
    cy.fixture('test-consumer-graphql-provider.json').then((expectedPact) => {
      expect(omitVersion(pactFile)).to.deep.equal(
        omitVersion(expectedPact, false),
      )
    })
  })
})
