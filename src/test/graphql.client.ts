import axios from 'axios'
import { GraphQLError } from 'graphql'
import { Todo } from './Todo'

const url = 'https://pact-js-mock.example.com/graphql'

async function graphql<TData, TVariables = unknown>({
  query,
  variables,
}: {
  query: string
  variables?: TVariables
}): Promise<TData> {
  const { data: response } = await axios.post<{
    data: TData
    errors?: GraphQLError[]
  }>(url, { query, variables })
  if (response.errors?.length) {
    throw response.errors[0]
  }
  return response.data
}
// define a function to fetch all To-Do items
export async function fetchTodos(): Promise<Todo[]> {
  // define the GraphQL query
  const query = `
    query todos {
      todos {
        id
        title
        description
        completed
      }
    }
  `

  // execute the query and get the data
  const { todos } = await graphql<{ todos: Todo[] }>({ query })

  // return the array of To-Do items
  return todos
}

// define a function to fetch all To-Do items
export async function todoById(id: string): Promise<Todo> {
  // define the GraphQL query
  const query = `
    query todoById($id: ID) {
      todoById(id: $id) {
        id
        title
        description
        completed
      }
    }
  `

  // execute the query and get the data
  const data = await graphql<{ todoById: Todo }>({
    query,
    variables: { id },
  })

  // return the To-Do items
  return data.todoById
}
// define a function to create a new To-Do item
export async function createTodo(title: string, description?: string) {
  // define the GraphQL mutation
  const query = `
    mutation createTodo($title: String!, $description: String) {
      createTodo(input: { title: $title, description: $description }) {
        id
        title
        description
        completed
      }
    }
  `

  // execute the mutation and get the data
  const data = await graphql<{ createTodo: Todo }>({
    query,
    variables: { title, description },
  })

  // return the newly created To-Do item
  return data.createTodo
}
