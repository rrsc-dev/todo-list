import React, { useState, useEffect } from 'react';
import './App.css';

// Interface TypeScript: Define a estrutura de uma tarefa
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// Interface para a resposta da API
interface ApiResponse {
  success: boolean;
  data?: Todo | Todo[];
  message?: string;
}

function App() {
  // Estados do componente usando React Hooks
  const [todos, setTodos] = useState<Todo[]>([]); // Lista de tarefas
  const [newTodoTitle, setNewTodoTitle] = useState(''); // Título da nova tarefa
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState(''); // Mensagens de erro

  // URL da API (ajuste conforme seu ambiente)
  const API_URL = 'http://localhost:8080/index.php/todos';

  // useEffect: Carrega as tarefas quando o componente é montado
  useEffect(() => {
    fetchTodos();
  }, []);

  // Função: Busca todas as tarefas da API
  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(API_URL);
      const data: ApiResponse = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setTodos(data.data);
      }
    } catch (err) {
      setError('Erro ao carregar tarefas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função: Cria uma nova tarefa
  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o reload da página
    
    if (!newTodoTitle.trim()) {
      setError('Digite um título para a tarefa');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodoTitle }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data && !Array.isArray(data.data)) {
        // Adiciona a nova tarefa à lista
        setTodos([...todos, data.data]);
        setNewTodoTitle(''); // Limpa o input
      } else {
        setError(data.message || 'Erro ao criar tarefa');
      }
    } catch (err) {
      setError('Erro ao criar tarefa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função: Alterna o estado de conclusão de uma tarefa
  const toggleTodo = async (todo: Todo) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data && !Array.isArray(data.data)) {
        // Atualiza a tarefa na lista
        setTodos(todos.map(t => t.id === todo.id ? data.data as Todo : t));
      } else {
        setError(data.message || 'Erro ao atualizar tarefa');
      }
    } catch (err) {
      setError('Erro ao atualizar tarefa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função: Remove uma tarefa
  const deleteTodo = async (id: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Remove a tarefa da lista
        setTodos(todos.filter(t => t.id !== id));
      } else {
        setError(data.message || 'Erro ao remover tarefa');
      }
    } catch (err) {
      setError('Erro ao remover tarefa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcula estatísticas
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;

  return (
    <div className="App">
      <div className="container">
        <h1>📝 To-Do List</h1>
        
        {/* Estatísticas */}
        <div className="stats">
          <span>Total: {totalTodos}</span>
          <span>Concluídas: {completedTodos}</span>
          <span>Pendentes: {totalTodos - completedTodos}</span>
        </div>

        {/* Formulário para adicionar nova tarefa */}
        <form onSubmit={createTodo} className="add-todo-form">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Digite uma nova tarefa..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Adicionar'}
          </button>
        </form>

        {/* Mensagem de erro */}
        {error && <div className="error">{error}</div>}

        {/* Lista de tarefas */}
        <div className="todo-list">
          {loading && todos.length === 0 ? (
            <p>Carregando...</p>
          ) : todos.length === 0 ? (
            <p className="empty-state">Nenhuma tarefa ainda. Adicione uma!</p>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  disabled={loading}
                />
                <span className="todo-title">{todo.title}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-btn"
                  disabled={loading}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;