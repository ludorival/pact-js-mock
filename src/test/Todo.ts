export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  ownerId?: string
}

// Type pour la fonction fetchTodos
export type FetchTodosApi = () => Promise<Todo[]>

// Type pour la fonction todoById
export type TodoByIdApi = (id: string) => Promise<Todo>

// Type pour la fonction createTodo
export type CreateTodoApi = (
  title: string,
  description?: string,
) => Promise<Todo>

export interface UserProfile {
  id: string
  name: string
  email?: string
}

export type FetchUserByIdApi = (id: string) => Promise<UserProfile>
