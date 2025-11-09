import React, { useEffect, useState } from 'react'
import CreateTodo from './CreateTodo'
import TodoDetails from './TodoDetails'
import {
  CreateTodoApi,
  FetchTodosApi,
  FetchUserByIdApi,
  Todo,
  TodoByIdApi,
} from '../../test/Todo'

interface TodoListProps {
  fetchTodos: FetchTodosApi
  createTodo: CreateTodoApi
  todoById: TodoByIdApi
  fetchUserById: FetchUserByIdApi
}
// Composant TodoList
const TodoList: React.FC<TodoListProps> = ({
  fetchTodos,
  createTodo,
  todoById,
  fetchUserById,
}) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const loadTodos = async () => {
    const todos = await fetchTodos()
    setTodos(todos)
  }
  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div>
      <h1>Todo List</h1>
      <CreateTodo
        createTodo={createTodo}
        onTodoCreated={() => fetchTodos().then(setTodos)}
      />
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => setSelectedTodoId(todo.id)}
            style={{ cursor: 'pointer' }}
          >
            <strong>{todo.title}</strong>
          </li>
        ))}
      </ul>
      <button id="reload" onClick={loadTodos}>
        Reload
      </button>

      {selectedTodoId && (
        <TodoDetails
          id={selectedTodoId}
          todoById={todoById}
          fetchUserById={fetchUserById}
        />
      )}
    </div>
  )
}

export default TodoList
