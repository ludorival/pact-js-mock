import axios, { Method } from 'axios'
import {
  CreateTodoApi,
  FetchTodosApi,
  FetchUserByIdApi,
  TodoByIdApi,
  UserProfile,
} from './Todo'

const baseUrl = 'https://pact-js-mock.example.com'

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
    url: `${baseUrl}${path}`,
    data: body,
  })

  return response
}
// define a function to fetch all To-Do items
export const fetchTodos: FetchTodosApi = () =>
  rest({ method: 'get', path: '/todo-service/todos?all=true' })

// define a function to fetch all To-Do items
export const todoById: TodoByIdApi = (id) =>
  rest({ method: 'get', path: `/todo-service/todos/${id}` })

// define a function to create a new To-Do item
export const createTodo: CreateTodoApi = (title, description) =>
  rest({
    method: 'post',
    path: `/todo-service/todos`,
    body: { title, description },
  })

export const fetchUserById: FetchUserByIdApi = (id: string) =>
  rest<UserProfile>({
    method: 'get',
    path: `/user-service/users/${id}`,
  })
