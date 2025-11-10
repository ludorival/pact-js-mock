import React from 'react'
import { mount } from '@cypress/react'
import * as props from '../../../test/rest.client'
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
  userByIdFound,
} from './handlers'
import { omitVersion } from '../../../test/utils'
import { pactRegistry } from '../../registry'
import type {} from '../../commands'

describe('To-Do list Rest API client', () => {
  describe('fetchTodos', () => {
    it('should fetch all To-Do items', () => {
      // use multipleTodos handlers from contracts
      cy.pactIntercept('GET', `/todo-service/todos?all=true`, multipleTodos).as(
        'multipleTodos',
      )

      // Mount the TodoList to fetchTodos function and get the actual data
      mount(<TodoList {...props} />)

      // expect the actual data to match the expected data
      void cy
        .wait('@multipleTodos')
        .its('response')
        .its('statusCode')
        .should('be.equal', 200)
      cy.then(() => {
        const todoPact = pactRegistry.get('todo-service')
        void expect(todoPact, 'todo-service pact exists').to.exist
        if (!todoPact) {
          return
        }
        void expect(todoPact.providerName).to.equal('todo-service')
      })
    })

    it('should get a technical failure the first time and an empty todo list', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })
      // use todosWillRaiseTechnicalFailure and emptyTodos handlers from contracts
      cy.pactIntercept(
        'GET',
        '/todo-service/todos?all=true',
        todosWillRaiseTechnicalFailure,
        {
          description: 'rest api returns a 500 http error',
          providerState: 'will return a 500 http error',
        },
      ).as('todosWillRaiseTechnicalFailure')
      // Mount the TodoList to fetchTodos function and get the actual data
      mount(<TodoList {...props} />)

      void cy
        .wait('@todosWillRaiseTechnicalFailure')
        .its('response')
        .its('statusCode')
        .should('be.equal', 500)

      cy.pactIntercept('GET', '/todo-service/todos?all=true', emptyTodos, {
        description: 'empty todo list',
      }).as('emptyTodos')
      // Reload the fetch
      cy.get('#reload').click()

      // expect the actual data to match the expected data
      void cy.wait('@emptyTodos').its('response.body').should('have.length', 0)
    })
  })

  describe('createTodo', () => {
    it('should create a new To-Do item', () => {
      // use createTodoWillSucceed handlers from contracts
      cy.pactIntercept('POST', '/todo-service/todos', createTodoWillSucceed, {
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
        .its('statusCode')
        .should('be.equal', 201)
    })
  })

  describe('todoById', () => {
    it('should get a todo by its id', () => {
      // use todoByIdFound handlers from contracts
      cy.pactIntercept('GET', '/todo-service/todos/*', todoByIdFound, {
        description: 'should found a todo item by its id',
        providerState: 'there is an existing todo item with this id',
      }).as('todoByIdFound')
      cy.pactIntercept('GET', '/user-service/users/*', userByIdFound, {
        description: 'should find the associated user',
      }).as('userByIdFound')

      // mount the TodoDetails and get the actual data
      mount(<TodoDetails id="1" {...props} />)

      // expect the actual data to match the expected status code
      void cy
        .wait('@todoByIdFound')
        .its('response')
        .its('statusCode')
        .should('be.equal', 200)
      void cy.wait('@userByIdFound')
      cy.contains('Owner: Alice Smith')
    })

    it('should get an error when getting a todo does not found it', () => {
      Cypress.on('uncaught:exception', () => {
        return false // ignore
      })
      // use todoByIdNotFound handlers from contracts
      cy.pactIntercept('GET', '/todo-service/todos/*', todoByIdNotFound, {
        description: 'should not found a todo item by its id',
      }).as('todoByIdNotFound')

      // mount the TodoDetails and get the actual data
      mount(<TodoDetails id="1" {...props} />)

      // expect the actual data to match the expected status code
      void cy
        .wait('@todoByIdNotFound')
        .its('response')
        .its('statusCode')
        .should('be.equal', 404)
    })
  })

  describe('pact metadata', () => {
    it('the generated pact metadata should match the configuration', () => {
      cy.then(() => {
        const todoPact = pactRegistry.get('todo-service')
        void expect(todoPact, 'todo-service pact exists').to.exist
        if (!todoPact) {
          return
        }
        const generatedTodo = todoPact.generatePactFile()
        return cy
          .fixture('test-consumer-todo-service.json')
          .then((expectedPact) => {
            void expect(omitVersion(generatedTodo)).to.deep.equal(
              omitVersion(expectedPact, false),
            )
          })
      })

      cy.then(() => {
        const userPact = pactRegistry.get('user-service')
        void expect(userPact, 'user-service pact exists').to.exist
        if (!userPact) {
          return
        }
        const generatedUser = userPact.generatePactFile()
        return cy
          .fixture('test-consumer-user-service.json')
          .then((expectedPact) => {
            void expect(omitVersion(generatedUser)).to.deep.equal(
              omitVersion(expectedPact, false),
            )
          })
      })
    })
  })
})
