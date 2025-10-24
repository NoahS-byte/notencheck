import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit3, Save, X, Calendar, Flag, Clock, Filter } from 'lucide-react';
import { TodoService, CloudTodo } from '../services/todoService';

interface TodoListProps {
  currentUserId: string;
}

const TodoList: React.FC<TodoListProps> = ({ currentUserId }) => {
  const [todos, setTodos] = useState<CloudTodo[]>([]);
  
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState('Allgemein');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTodos();
  }, [currentUserId]);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const cloudTodos = await TodoService.getTodos(currentUserId);
      setTodos(cloudTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      setIsLoading(true);
      const newCloudTodo = await TodoService.saveTodo(
        currentUserId,
        newTodo.trim(),
        newPriority,
        newDueDate || undefined,
        newCategory
      );
      
      setTodos([newCloudTodo, ...todos]);
      setNewTodo('');
      setNewDueDate('');
      setNewCategory('Allgemein');
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Fehler beim Hinzufügen der Aufgabe');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : undefined
      };
      
      await TodoService.updateTodo(id, updatedTodo);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
      alert('Fehler beim Aktualisieren der Aufgabe');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await TodoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Fehler beim Löschen der Aufgabe');
    }
  };

  const startEdit = (todo: CloudTodo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    
    try {
      const todo = todos.find(t => t.id === editingId);
      if (!todo) return;
      
      const updatedTodo = { ...todo, text: editText.trim() };
      await TodoService.updateTodo(editingId!, updatedTodo);
      
      setTodos(todos.map(t => t.id === editingId ? updatedTodo : t));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Fehler beim Speichern der Änderungen');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  const getCategories = () => {
    const categories = Array.from(new Set(todos.map(todo => todo.category)));
    return ['Allgemein', ...categories.filter(cat => cat !== 'Allgemein')];
  };

  const filteredTodos = todos.filter(todo => {
    const statusMatch = filter === 'all' || 
                       (filter === 'active' && !todo.completed) || 
                       (filter === 'completed' && todo.completed);
    
    const categoryMatch = categoryFilter === 'all' || todo.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => !t.completed && isOverdue(t.dueDate)).length
  };

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-900">
        <CheckSquare className="h-8 w-8 text-gray-900" />
        <h2 className="text-3xl font-bold text-gray-900">ToDo Liste</h2>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 border-2 border-gray-900 p-4 text-center">
          <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          <div className="text-sm font-medium text-gray-700">Gesamt</div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 p-4 text-center">
          <div className="text-2xl font-black text-blue-600">{stats.active}</div>
          <div className="text-sm font-medium text-blue-700">Offen</div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 p-4 text-center">
          <div className="text-2xl font-black text-green-600">{stats.completed}</div>
          <div className="text-sm font-medium text-green-700">Erledigt</div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 p-4 text-center">
          <div className="text-2xl font-black text-red-600">{stats.overdue}</div>
          <div className="text-sm font-medium text-red-700">Überfällig</div>
        </div>
      </div>

      {/* Add New Todo */}
      <div className="bg-gray-50 border-2 border-gray-900 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Neue Aufgabe hinzufügen</h3>
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Was möchten Sie erledigen?"
              className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Priorität</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
              >
                <option value="low">🟢 Niedrig</option>
                <option value="medium">🟡 Mittel</option>
                <option value="high">🔴 Hoch</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Fälligkeitsdatum</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Kategorie</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="z.B. Arbeit, Privat"
                className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addTodo}
                disabled={!newTodo.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" />
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-900" />
          <span className="font-bold text-gray-900">Filter:</span>
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Alle' },
            { key: 'active', label: 'Offen' },
            { key: 'completed', label: 'Erledigt' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 font-bold transition-colors ${
                filter === filterOption.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
        >
          <option value="all">Alle Kategorien</option>
          {getCategories().map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {filter === 'all' ? 'Keine Aufgaben vorhanden' :
               filter === 'active' ? 'Keine offenen Aufgaben' :
               'Keine erledigten Aufgaben'}
            </p>
            <p className="text-sm">
              {filter === 'all' && 'Fügen Sie Ihre erste Aufgabe hinzu!'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`border-2 p-4 transition-all duration-300 ${
                todo.completed 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : isOverdue(todo.dueDate)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {todo.completed && '✓'}
                </button>
                
                <div className="flex-1 min-w-0">
                  {editingId === todo.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`font-medium text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.text}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className={`px-2 py-1 border text-xs font-bold ${getPriorityColor(todo.priority)}`}>
                          {getPriorityIcon(todo.priority)} {todo.priority.toUpperCase()}
                        </div>
                        
                        <div className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700">
                          {todo.category}
                        </div>
                        
                        {todo.dueDate && (
                          <div className={`flex items-center gap-1 px-2 py-1 border text-xs font-bold ${
                            isOverdue(todo.dueDate) && !todo.completed
                              ? 'text-red-600 bg-red-50 border-red-200'
                              : 'text-blue-600 bg-blue-50 border-blue-200'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {todo.dueDate}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Erstellt: {new Date(todo.createdAt).toLocaleDateString('de-DE')}
                        </div>
                        
                        {todo.completedAt && (
                          <div className="text-xs text-green-600">
                            Erledigt: {new Date(todo.completedAt).toLocaleDateString('de-DE')}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {editingId !== todo.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {todos.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-gray-900">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                if (confirm('Alle erledigten Aufgaben löschen?')) {
                  setTodos(todos.filter(todo => !todo.completed));
                }
              }}
              disabled={stats.completed === 0}
              className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Erledigte löschen ({stats.completed})
            </button>
            
            <button
              onClick={() => {
                if (confirm('Alle Aufgaben als erledigt markieren?')) {
                  setTodos(todos.map(todo => ({ 
                    ...todo, 
                    completed: true, 
                    completedAt: todo.completed ? todo.completedAt : Date.now() 
                  })));
                }
              }}
              disabled={stats.active === 0}
              className="px-4 py-2 bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Alle als erledigt markieren ({stats.active})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;