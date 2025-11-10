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
  todoByIdFound,
  todoByIdNotFound,
  todosWillRaiseTechnicalFailure,
} from './handlers'
import { omitVersion } from '../../../test/utils'
import { pactRegistry } from '../../registry'

describe('To-Do list GraphQL API client', () => {
  describe('fetchTodos', () => {
    it('should fetch all To-Do items', () => {
      // use multipleTodos handlers from contracts
      cy.pactIntercept('POST', `/graphql`, multipleTodos, {
        description: 'should list todo items using GraphQL',
      }).as('multipleTodos')

      // Mount the TodoList to fetchTodos function and get the actual data
      mount(<TodoList {...props} />)

      // expect the actual data to match the expected data
      cy.wait('@multipleTodos')
        .its('response')
        .its('body')
        .its('data.todos')
        .should('have.length', 3)
      cy.then(() => {
        expect(pactRegistry.getAll()[0].providerName).to.equal('graphql')
      })
    })

    it('should get a technical failure the first time and an empty todo list', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })
      // use todosWillRaiseTechnicalFailure and emptyTodos handlers from contracts
      cy.pactIntercept('POST', `/graphql`, todosWillRaiseTechnicalFailure, {
        description: 'graphql api returns a 500 http error',
        providerState: 'will return a 500 http error',
      }).as('todosWillRaiseTechnicalFailure')
      // Mount the TodoList to fetchTodos function and get the actual data
      mount(<TodoList {...props} />)

      cy.wait('@todosWillRaiseTechnicalFailure')
        .its('response')
        .its('statusCode')
        .should('be.equal', 500)

      cy.pactIntercept('POST', `/graphql`, emptyTodos, {
        description: 'empty todo list',
      }).as('emptyTodos')
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
      cy.pactIntercept('POST', `/graphql`, createTodoWillSucceed, {
        description: 'should create a Todo with success',
      }).as('createTodoWillSucceed')

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
      cy.pactIntercept('POST', `/graphql`, todoByIdFound, {
        description: 'should found a todo item by its id',
        providerState: 'there is an existing todo item with this id',
      }).as('todoByIdFound')

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
      // use todoByIdNotFound handlers from contracts
      cy.pactIntercept('POST', `/graphql`, todoByIdNotFound, {
        description: 'should not found a todo item by its id',
      }).as('todoByIdNotFound')

      // mount the TodoDetails and get the actual data
      mount(<TodoDetails id="1" {...props} />)

      // expect the actual data to match the expected status code
      cy.wait('@todoByIdNotFound')
        .its('response')
        .its('body.errors')
        .should('deep.equal', [{ message: 'The todo item 1 is not found' }])
    })
  })
  describe('pact metadata', () => {
    it('the generated pact metadata should match the configuration', () => {
      cy.then(() => {
        const pactFile = pactRegistry.getAll()[0].generatePactFile()
        expect(pactFile.consumer.name).to.equal('test-consumer')
        expect(pactFile.provider.name).to.equal('graphql')
        return cy.fixture('test-consumer-graphql.json').then((expectedPact) => {
          expect(omitVersion(pactFile)).to.deep.equal(
            omitVersion(expectedPact, false),
          )
        })
      })
    })
  })
})
