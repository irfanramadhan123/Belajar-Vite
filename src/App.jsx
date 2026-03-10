import { useEffect, useMemo, useState } from 'react'
import './App.css'

const todoStorageKey = 'belajar-react-vite.todos'
const themeStorageKey = 'belajar-react-vite.theme'

const initialTodos = [
  {
    id: 1,
    text: 'Pelajari useState',
    done: true,
    category: 'React',
    deadline: '2026-03-08',
  },
  {
    id: 2,
    text: 'Buat komponen latihan',
    done: false,
    category: 'Coding',
    deadline: '2026-03-12',
  },
  {
    id: 3,
    text: 'Coba tambah tugas baru',
    done: false,
    category: 'Project',
    deadline: '2026-03-15',
  },
]

function normalizeTodos(todos) {
  return todos.map((todo) => ({
    ...todo,
    deadline: todo.deadline ?? '',
  }))
}

function formatDeadline(deadline) {
  if (!deadline) return 'Tanpa deadline'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(deadline))
}

function isOverdue(deadline, done) {
  if (!deadline || done) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return new Date(deadline) < today
}

function getDeadlineStatus(deadline, done) {
  if (!deadline) {
    return { label: 'Fleksibel', tone: 'neutral' }
  }

  if (done) {
    return { label: 'Selesai', tone: 'success' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(deadline)
  const diffInDays = Math.round((dueDate - today) / 86400000)

  if (diffInDays < 0) {
    return { label: 'Terlambat', tone: 'danger' }
  }

  if (diffInDays === 0) {
    return { label: 'Hari ini', tone: 'warning' }
  }

  if (diffInDays === 1) {
    return { label: 'Besok', tone: 'info' }
  }

  return { label: `${diffInDays} hari lagi`, tone: 'neutral' }
}

function App() {
  const [task, setTask] = useState('')
  const [category, setCategory] = useState('')
  const [deadline, setDeadline] = useState('')
  const [filter, setFilter] = useState('all')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(themeStorageKey) ?? 'light'
  })
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem(todoStorageKey)
    return savedTodos ? normalizeTodos(JSON.parse(savedTodos)) : initialTodos
  })

  useEffect(() => {
    localStorage.setItem(todoStorageKey, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.done).length,
    [todos],
  )

  const remainingTodos = todos.length - completedTodos
  const progress = todos.length
    ? Math.round((completedTodos / todos.length) * 100)
    : 0

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.done)
    }

    if (filter === 'done') {
      return todos.filter((todo) => todo.done)
    }

    return todos
  }, [filter, todos])

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedTask = task.trim()
    if (!trimmedTask) return

    setTodos((currentTodos) => [
      {
        id: Date.now(),
        text: trimmedTask,
        done: false,
        category: category.trim() || 'Umum',
        deadline,
      },
      ...currentTodos,
    ])
    setTask('')
    setCategory('')
    setDeadline('')
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.done))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-topbar">
            <p className="eyebrow">Belajar React + Vite</p>
            <button
              type="button"
              className="theme-toggle"
              onClick={() =>
                setTheme((currentTheme) =>
                  currentTheme === 'light' ? 'dark' : 'light',
                )
              }
            >
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
          </div>
          <h1>Kelola tugas dengan tampilan yang lebih hidup</h1>
          <p className="intro">
            Catat pekerjaan, atur jenis tugas, dan pantau deadline dalam satu
            dashboard yang lebih rapi dan interaktif.
          </p>
          <div className="hero-highlights">
            <span className="highlight-pill">Auto save</span>
            <span className="highlight-pill">Deadline tracker</span>
            <span className="highlight-pill">Light & dark mode</span>
          </div>
        </div>

        <div className="hero-card">
          <p className="hero-card-label">Progress hari ini</p>
          <p className="hero-card-value">{progress}%</p>
          <div className="progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>
            {completedTodos} selesai dari {todos.length} tugas
          </small>
        </div>
      </section>

      <section className="stats-row">
        <article className="stat-box stat-box-total">
          <span>Total</span>
          <strong>{todos.length}</strong>
        </article>
        <article className="stat-box stat-box-active">
          <span>Aktif</span>
          <strong>{remainingTodos}</strong>
        </article>
        <article className="stat-box stat-box-done">
          <span>Selesai</span>
          <strong>{completedTodos}</strong>
        </article>
      </section>

      <section className="planner-section">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Tugas Anda</h2>
              <p className="panel-note">
                Tugas tersimpan otomatis di browser beserta kategori dan
                deadline
              </p>
            </div>
            <span className="badge">{remainingTodos} tersisa</span>
          </div>

          <form className="todo-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Tulis tugas baru"
              value={task}
              onChange={(event) => setTask(event.target.value)}
            />
            <input
              type="text"
              placeholder="Jenis tugas"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
            <button type="submit">Tambah</button>
          </form>

          <div className="toolbar">
            <div className="filters">
              <button
                type="button"
                className={filter === 'all' ? 'filter active' : 'filter'}
                onClick={() => setFilter('all')}
              >
                Semua
              </button>
              <button
                type="button"
                className={filter === 'active' ? 'filter active' : 'filter'}
                onClick={() => setFilter('active')}
              >
                Aktif
              </button>
              <button
                type="button"
                className={filter === 'done' ? 'filter active' : 'filter'}
                onClick={() => setFilter('done')}
              >
                Selesai
              </button>
            </div>

            <button type="button" className="ghost" onClick={clearCompleted}>
              Hapus selesai
            </button>
          </div>

          <ul className="todo-list">
            {filteredTodos.map((todo) => {
              const deadlineStatus = getDeadlineStatus(todo.deadline, todo.done)

              return (
                <li
                  key={todo.id}
                  className={
                    todo.done
                      ? 'todo done'
                      : isOverdue(todo.deadline, todo.done)
                        ? 'todo overdue'
                        : 'todo'
                  }
                >
                  <label className="todo-main">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span className="todo-text-group">
                      <strong>{todo.text}</strong>
                      <small>{formatDeadline(todo.deadline)}</small>
                    </span>
                  </label>

                  <div className="todo-meta">
                    <span className="tag">{todo.category}</span>
                    <span className={`status-pill ${deadlineStatus.tone}`}>
                      {deadlineStatus.label}
                    </span>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {filteredTodos.length === 0 ? (
            <p className="empty-state">
              Tidak ada tugas pada filter ini. Tambah tugas baru atau ganti
              filter.
            </p>
          ) : null}
        </article>
      </section>
    </main>
  )
}

export default App
