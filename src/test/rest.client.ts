import axios, { Method } from 'axios'
import { CreateTodoApi, FetchTodosApi, TodoByIdApi } from './Todo'

const url = 'https://pact-js-mock.example.com/api'

async function rest<TData, TVariables = unknown>({
  method,
  path,
  body,
}: {
  method: Method
  path: string
  body?: TVariables
}): Promise<TData> {
  const { data: response } = await axios<TData>({
    method,
    url: `${url}${path}`,
    data: body,
  })

  return response
}
// define a function to fetch all To-Do items
export const fetchTodos: FetchTodosApi = () =>
  rest({ method: 'get', path: '/todos?all=true' })

// define a function to fetch all To-Do items
export const todoById: TodoByIdApi = (id) =>
  rest({ method: 'get', path: `/todos/${id}` })

// define a function to create a new To-Do item
export const createTodo: CreateTodoApi = (title, description) =>
  rest({
    method: 'post',
    path: `/todos`,
    body: { title, description },
  })
