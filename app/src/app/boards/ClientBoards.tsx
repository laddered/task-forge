"use client";
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Dialog } from '@headlessui/react';

// Тип задачи для типизации
interface TaskType {
  id: string;
  title: string;
  description: string;
  order: number;
}

// Task-компонент
function Task({ task, onRename, onDelete, loading }: {
  task: { id: string; title: string; description: string; order: number };
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  useEffect(() => { setTitle(task.title); }, [task.title]);
  function handleRename() {
    if (title.trim() && title !== task.title) onRename(task.id, title);
    setIsEditing(false);
  }
  return (
    <div className="bg-white rounded shadow p-2 mb-2 flex flex-col h-28 min-h-28 max-h-28">
      <div className="flex items-center mb-1">
        <button className="mr-1" onClick={() => setIsEditing(true)} title="Переименовать" disabled={loading}>✏️</button>
        {isEditing ? (
          <input
            className="border rounded px-1 py-0.5 text-sm w-24 mr-2 text-gray-800"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
            autoFocus
            disabled={loading}
          />
        ) : (
          <span className="font-semibold text-gray-800 flex-1 truncate">{task.title}</span>
        )}
        <button className="ml-auto text-red-500" onClick={() => onDelete(task.id)} title="Удалить" disabled={loading}>❌</button>
      </div>
      <div className="text-sm text-gray-600 mt-2 break-words">{task.description}</div>
    </div>
  );
}

// Компонент одной колонки (UI + задачи)
function Column({ column, onRename, onDelete, loading }: {
  column: { id: string; title: string; order: number };
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  // Для модалки удаления таска
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Загрузка задач при монтировании/смене колонки
  useEffect(() => {
    let ignore = false;
    async function fetchTasks() {
      setLoadingTasks(true);
      const res = await fetch(`/api/tasks?columnId=${column.id}`);
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setTasks(data.tasks);
      }
      setLoadingTasks(false);
    }
    fetchTasks();
    return () => { ignore = true; };
  }, [column.id]);

  // Добавить таск
  async function handleAddTask() {
    setLoadingTasks(true);
    const newOrder = tasks.length + 1;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: column.id, order: newOrder, title: `Новый таск ${newOrder}` })
    });
    if (res.ok) {
      const data = await fetch(`/api/tasks?columnId=${column.id}`);
      if (data.ok) {
        const json = await data.json();
        setTasks(json.tasks.sort((a: TaskType, b: TaskType) => b.order - a.order));
      }
    }
    setLoadingTasks(false);
  }
  // Переименовать таск
  async function handleRenameTask(id: string, title: string) {
    setLoadingTasks(true);
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title })
    });
    if (res.ok) {
      setTasks(ts => ts.map(t => t.id === id ? { ...t, title } : t));
    }
    setLoadingTasks(false);
  }
  // Изменить описание таска
  async function handleEditDesc(id: string, description: string) {
    setLoadingTasks(true);
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, description })
    });
    if (res.ok) {
      setTasks(ts => ts.map(t => t.id === id ? { ...t, description } : t));
    }
    setLoadingTasks(false);
  }
  // Удалить таск (после подтверждения)
  async function handleDeleteTask(id: string) {
    setLoadingTasks(true);
    const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      // После удаления пересортируем order
      const data = await fetch(`/api/tasks?columnId=${column.id}`);
      if (data.ok) {
        const json = await data.json();
        setTasks(json.tasks);
      } else {
        setTasks(ts => ts.filter(t => t.id !== id));
      }
    }
    setLoadingTasks(false);
    setTaskToDelete(null);
  }

  // Сбросить локальное состояние названия при изменении пропса
  useEffect(() => { setTitle(column.title); }, [column.title]);

  // Сохранить новое название
  function handleRename() {
    if (title.trim() && title !== column.title) {
      onRename(column.id, title);
    }
    setIsEditing(false);
  }

  return (
    <div className="bg-gray-300 rounded shadow p-4 w-64 mr-4 flex-shrink-0 opacity-100">
      <div className="flex items-center mb-2">
        {/* Кнопка-карандаш для переименования */}
        <button className="mr-2" onClick={() => setIsEditing(true)} title="Переименовать" disabled={loading}>
          ✏️
        </button>
        {/* Поле ввода для редактирования названия */}
        {isEditing ? (
          <input
            className="border rounded px-1 py-0.5 text-sm w-24 mr-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
            autoFocus
            disabled={loading}
          />
        ) : (
          <span className="font-semibold text-gray-800 flex-1">{column.title}</span>
        )}
        {/* Кнопка-крестик для удаления */}
        <button className="ml-auto text-red-500" onClick={() => onDelete(column.id)} title="Удалить" disabled={loading}>
          ❌
        </button>
      </div>
      {/* Кнопка "Добавить таск" всегда над списком */}
      <div className="flex flex-col mb-2">
        <button className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded mb-2 transition-colors" onClick={handleAddTask} disabled={loadingTasks}>+ Добавить таск</button>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {tasks.sort((a: TaskType, b: TaskType) => b.order - a.order).map(task => (
          <Task
            key={task.id}
            task={task}
            onRename={handleRenameTask}
            onDelete={() => setTaskToDelete(task.id)}
            loading={loadingTasks}
          />
        ))}
      </div>
      {/* Модалка подтверждения удаления таска */}
      <Dialog open={!!taskToDelete} onClose={() => setTaskToDelete(null)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-2">Удалить задачу?</Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-200">Вы уверены, что хотите удалить эту задачу? Это действие необратимо.</Dialog.Description>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded" onClick={() => setTaskToDelete(null)} disabled={loadingTasks}>Отмена</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50" onClick={() => taskToDelete && handleDeleteTask(taskToDelete)} disabled={loadingTasks}>{loadingTasks ? "Удаление..." : "Удалить"}</button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}

// Компонент отображения выбранной доски и её колонок
function BoardView({ board }: { board: { id: string; name: string } }) {
  // Список колонок
  const [columns, setColumns] = useState<{ id: string; title: string; order: number }[]>([]);
  // Название для новой колонки
  const [newColTitle, setNewColTitle] = useState("");
  // Флаг загрузки/операций
  const [loading, setLoading] = useState(false);
  // id колонки, которую хотим удалить (для модалки)
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  // Загрузка колонок с сервера при смене доски
  useEffect(() => {
    let ignore = false;
    async function fetchColumns() {
      setLoading(true);
      const res = await fetch(`/api/columns?boardId=${board.id}`);
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setColumns(data.columns);
      }
      setLoading(false);
    }
    fetchColumns();
    return () => { ignore = true; };
  }, [board.id]);

  // Создать новую колонку через API
  async function handleAddColumn() {
    if (!newColTitle.trim()) return;
    setLoading(true);
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: board.id, title: newColTitle })
    });
    if (res.ok) {
      setNewColTitle("");
      // Добавить новую колонку в список
      const data = await res.json();
      setColumns(cols => [...cols, data.column]);
    }
    setLoading(false);
  }

  // Переименовать колонку через API
  async function handleRenameColumn(id: string, title: string) {
    setLoading(true);
    const res = await fetch('/api/columns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title })
    });
    if (res.ok) {
      setColumns(cols => cols.map(c => c.id === id ? { ...c, title } : c));
    }
    setLoading(false);
  }

  // Удалить колонку через API (после подтверждения)
  async function handleDeleteColumn(id: string) {
    setLoading(true);
    const res = await fetch(`/api/columns?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setColumns(cols => cols.filter(c => c.id !== id));
    }
    setLoading(false);
    setColumnToDelete(null);
  }

  return (
    <section className="flex-1 p-8 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">{board.name}</h2>
      {/* Форма создания новой колонки */}
      <div className="flex items-end mb-4">
        <input
          className="border rounded px-2 py-1 mr-2"
          placeholder="Новая колонка"
          value={newColTitle}
          onChange={e => setNewColTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); }}
          disabled={loading}
        />
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAddColumn} disabled={loading}>
          + Добавить колонку
        </button>
      </div>
      {/* Список колонок */}
      <div className="flex">
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            onRename={handleRenameColumn}
            onDelete={() => setColumnToDelete(col.id)}
            loading={loading}
          />
        ))}
      </div>
      {/* Модалка подтверждения удаления колонки */}
      <Dialog open={!!columnToDelete} onClose={() => setColumnToDelete(null)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-2">Удалить колонку?</Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-200">Вы уверены, что хотите удалить эту колонку? Это действие необратимо.</Dialog.Description>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded" onClick={() => setColumnToDelete(null)} disabled={loading}>Отмена</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50" onClick={() => columnToDelete && handleDeleteColumn(columnToDelete)} disabled={loading}>{loading ? "Удаление..." : "Удалить"}</button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </section>
  );
}

// Главный компонент: список досок, выбор доски, отображение BoardView
export default function ClientBoards({ boards: initialBoards, userId }: { boards: { id: string, name: string }[]; userId: string }) {
  // boards — локальное состояние списка досок
  const [boards, setBoards] = useState(initialBoards);
  // id выбранной доски
  const [selectedBoardId, setSelectedBoardId] = useState(initialBoards[0]?.id || "");

  // Получить актуальный список досок с сервера
  async function refreshBoards() {
    const res = await fetch("/api/boards");
    if (res.ok) {
      const data = await res.json();
      setBoards(data.boards);
    }
  }

  // Обновить имя доски локально после успешного PATCH
  function handleBoardRenamed(id: string, name: string) {
    setBoards(boards => boards.map(b => b.id === id ? { ...b, name } : b));
  }

  // Найти выбранную доску
  const selectedBoard = boards.find(b => b.id === selectedBoardId);

  return (
    <main className="p-8 flex flex-col">
      <h1 className="text-2xl font-bold">Ваши доски</h1>
      <div className="flex">
        {/* Sidebar — боковая панель со списком досок и действиями */}
        <Sidebar
          boards={boards}
          userId={userId}
          onBoardCreated={refreshBoards}
          onBoardDeleted={refreshBoards}
          onBoardRenamed={handleBoardRenamed}
          selectedBoardId={selectedBoardId}
          onSelectBoard={setSelectedBoardId}
        />
        {/* BoardView — отображение выбранной доски и её колонок */}
        {selectedBoard && <BoardView board={selectedBoard} />}
      </div>
    </main>
  );
} 