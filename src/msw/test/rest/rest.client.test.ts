import { setupServer } from 'msw/node'
import {
  createTodoWillSucceed,
  emptyTodos,
  multipleTodos,
  todoByIdFound,
  todoByIdNotFound,
  todosWillRaiseTechnicalFailure,
} from './handlers'
import { createTodo, fetchTodos, todoById } from '../../../test/rest.client'
import { omitVersion } from '../../../test/utils'
import { pactRegistry } from '../../registry'

const server = setupServer()

beforeAll(() => {
  pactRegistry.clear()
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('To-Do list Rest API client', () => {
  describe('fetchTodos', () => {
    it('should fetch all To-Do items', async () => {
      // use multipleTodos handlers from contracts
      server.use(multipleTodos)

      // call the fetchTodos function and get the actual data
      const actualData = await fetchTodos()

      // expect the actual data to match the expected data
      expect(actualData).toMatchSnapshot()
    })

    it('should get a technical failure the first time and an empty todo list', async () => {
      // use todosWillRaiseTechnicalFailure and emptyTodos handlers from contracts
      server.use(todosWillRaiseTechnicalFailure)

      // call first time fetchTodos should return an error
      expect.assertions(2)
      await fetchTodos().catch((e) =>
        expect(e).toMatchObject({
          message: 'Request failed with status code 500',
        }),
      )

      server.resetHandlers(emptyTodos)

      // call the fetchTodos function and get the actual data
      const actualData = await fetchTodos()

      // expect the actual data to match the expected data
      expect(actualData).toEqual([])
    })
  })

  describe('createTodo', () => {
    it('should create a new To-Do item', async () => {
      // use createTodoWillSucceed handlers from contracts
      server.use(createTodoWillSucceed)

      // call the createTodo function and get the actual data
      const actualData = await createTodo('Buy groceries')

      // expect the actual data to match the expected data
      expect(actualData).toMatchSnapshot()
    })
  })

  describe('todoById', () => {
    it('should get a todo by its id', async () => {
      // use todoByIdFound handlers from contracts
      server.use(todoByIdFound)

      // call the todoById function and get the actual data
      const actualData = await todoById('1')

      // expect the actual data to match the expected data
      expect(actualData).toMatchSnapshot()
    })

    it('should get an error when getting a todo does not found it', async () => {
      // use todoByIdFound handlers from contracts
      server.use(todoByIdNotFound)

      // call the todoById function and get the actual data
      try {
        await todoById('1')
        fail('Should never reach')
      } catch (e: unknown) {
        expect(e).toMatchObject({
          message: 'Request failed with status code 404',
        })
      }
    })
  })
})
it('the pact file can be generated and match with the snapshot', () => {
  const pactFile = pactRegistry.getAll()[0].generatePactFile()
  expect(omitVersion(pactFile)).toMatchSnapshot()
})
