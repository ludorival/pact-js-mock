import React, { useState, useEffect } from 'react'
import {
  FetchUserByIdApi,
  Todo,
  TodoByIdApi,
  UserProfile,
} from '../../test/Todo'

// Composant TodoDetails
interface TodoDetailsProps {
  id: string
  todoById: TodoByIdApi
  fetchUserById: FetchUserByIdApi
}

const TodoDetails: React.FC<TodoDetailsProps> = ({
  id,
  todoById,
  fetchUserById,
}) => {
  const [todo, setTodo] = useState<Todo>()
  const [user, setUser] = useState<UserProfile | null>(null)
  useEffect(() => {
    let cancelled = false
    todoById(id).then((result) => {
      if (cancelled) return
      setTodo(result)
      if (result.ownerId) {
        fetchUserById(result.ownerId)
          .then((profile) => {
            if (!cancelled) setUser(profile)
          })
          .catch(() => {
            if (!cancelled) setUser(null)
          })
      } else {
        setUser(null)
      }
    })

    return () => {
      cancelled = true
    }
  }, [id, todoById, fetchUserById])
  return (
    <div>
      <h2>Todo Details</h2>
      <p>
        <strong>Title:</strong> {todo?.title}
      </p>
      <p>
        <strong>Description:</strong>{' '}
        {todo?.description || 'No description available'}
      </p>
      {user && (
        <p>
          <strong>Owner:</strong> {user.name}
          {user.email ? ` (${user.email})` : ''}
        </p>
      )}
    </div>
  )
}

export default TodoDetails
