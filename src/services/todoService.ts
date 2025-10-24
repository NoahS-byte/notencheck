import { supabase } from '../lib/supabase'

export interface CloudTodo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  category: string
  createdAt: string
  completedAt?: string
}

export class TodoService {
  static async getTodos(userId: string): Promise<CloudTodo[]> {
    try {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return todos.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.due_date,
        category: todo.category,
        createdAt: todo.created_at,
        completedAt: todo.completed_at
      }))
    } catch (error) {
      console.error('Get todos error:', error)
      throw error
    }
  }

  static async saveTodo(
    userId: string,
    text: string,
    priority: 'low' | 'medium' | 'high',
    dueDate?: string,
    category: string = 'Allgemein'
  ): Promise<CloudTodo> {
    try {
      const { data: todo, error } = await supabase
        .from('todos')
        .insert({
          user_id: userId,
          text,
          priority,
          due_date: dueDate,
          category,
          completed: false
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.due_date,
        category: todo.category,
        createdAt: todo.created_at,
        completedAt: todo.completed_at
      }
    } catch (error) {
      console.error('Save todo error:', error)
      throw error
    }
  }

  static async updateTodo(todoId: string, updates: Partial<CloudTodo>): Promise<void> {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          text: updates.text,
          completed: updates.completed,
          priority: updates.priority,
          due_date: updates.dueDate,
          category: updates.category,
          completed_at: updates.completed ? new Date().toISOString() : null
        })
        .eq('id', todoId)

      if (error) throw error
    } catch (error) {
      console.error('Update todo error:', error)
      throw error
    }
  }

  static async deleteTodo(todoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)

      if (error) throw error
    } catch (error) {
      console.error('Delete todo error:', error)
      throw error
    }
  }
}