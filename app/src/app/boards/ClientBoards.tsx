"use client";
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Dialog } from '@headlessui/react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Тип задачи для типизации
interface TaskType {
  id: string;
  title: string;
  description: string;
  order: number;
  columnId: string; // Добавляем columnId для связи с колонкой
}

// Task-компонент с dnd-kit
function SortableTask({ task, onRename, onDelete, onEditDesc, loading, listeners, attributes, isDragging, setNodeRef, style }: {
  task: { id: string; title: string; description: string; order: number };
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onEditDesc?: (id: string, description: string) => void;
  loading?: boolean;
  listeners?: any;
  attributes?: any;
  isDragging?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [desc, setDesc] = useState(task.description);
  useEffect(() => { setTitle(task.title); }, [task.title]);
  useEffect(() => { setDesc(task.description); }, [task.description]);
  function handleRename() {
    const safeTitle = title.trim() === '' ? 'Не может быть пустым!' : title;
    if (safeTitle !== task.title) onRename(task.id, safeTitle);
    setIsEditing(false);
  }
  function handleEditDescSave() {
    const safeDesc = desc.trim() === '' ? 'Не может быть пустым!' : desc;
    if (safeDesc !== task.description && onEditDesc) onEditDesc(task.id, safeDesc);
    setIsEditingDesc(false);
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded shadow p-2 mb-2 flex flex-col h-28 min-h-28 max-h-28 transition-all duration-150 ${isDragging ? 'opacity-50 border-2 border-blue-500' : ''}`}
    >
      <div className="flex items-center mb-1">
        {/* Удалена кнопка карандаша, теперь редактирование по двойному клику */}
        {isEditing ? (
          <input
            className="w-24 mr-2 text-sm font-semibold text-gray-800 truncate select-text hover:cursor-text bg-transparent outline-none border-none focus:ring-0"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
            autoFocus
            disabled={loading}
          />
        ) : (
          <span
            className="font-semibold text-gray-800 flex-1 truncate select-text hover:cursor-text"
            onDoubleClick={() => setIsEditing(true)}
            title="Двойной клик для редактирования"
            style={{ cursor: 'text' }}
          >
            {task.title}
          </span>
        )}
        <button className="ml-auto text-red-500" onClick={() => onDelete(task.id)} title="Удалить" disabled={loading}>❌</button>
      </div>
      <div className="text-sm text-gray-600 mt-2 break-words flex items-start gap-1">
        {isEditingDesc ? (
          <div className="flex flex-col w-full">
            <textarea
              className="w-full text-sm text-gray-600 resize-none bg-transparent outline-none border-none focus:ring-0 select-text hover:cursor-text"
              value={desc}
              onChange={e => setDesc(e.target.value.slice(0, 100))}
              onBlur={handleEditDescSave}
              onKeyDown={e => {
                if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || (e.key === 'Enter' && !e.shiftKey)) {
                  e.preventDefault();
                  handleEditDescSave();
                }
                if (e.key === 'Escape') {
                  setIsEditingDesc(false);
                  setDesc(task.description);
                }
              }}
              autoFocus
              disabled={loading}
              rows={2}
              maxLength={100}
            />
            <div className="text-xs text-gray-400 text-right mt-0.5">{desc.length}/100</div>
          </div>
        ) : (
          <>
            <span
              className="flex-1 whitespace-pre-line overflow-hidden text-ellipsis block max-h-10 select-text hover:cursor-text"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', cursor: 'text' }}
              onDoubleClick={() => setIsEditingDesc(true)}
              title="Двойной клик для редактирования описания"
            >
              {task.description}
            </span>
            {/* Кнопка карандаша удалена */}
          </>
        )}
      </div>
    </div>
  );
}

// DND-обертка для таска
function DraggableTask({ task, onRename, onDelete, onEditDesc, loading }: {
  task: TaskType;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onEditDesc?: (id: string, description: string) => void;
  loading?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    // position: isDragging ? 'relative' : undefined, // убрано для устранения ошибки типов
  };
  return (
    <SortableTask
      task={task}
      onRename={onRename}
      onDelete={onDelete}
      onEditDesc={onEditDesc}
      loading={loading}
      listeners={listeners}
      attributes={attributes}
      setNodeRef={setNodeRef}
      isDragging={isDragging}
      style={style}
    />
  );
}

// Компонент одной колонки (UI + задачи)
function Column({ column, tasks, onAddTask, onRenameTask, onEditDesc, onDeleteTask, onDeleteColumn, loading, activeTaskId, addTaskError, handleAddTask }: {
  column: { id: string; title: string; order: number };
  tasks: TaskType[];
  onAddTask: (columnId: string) => void;
  onRenameTask: (id: string, title: string) => void;
  onEditDesc: (id: string, description: string) => void;
  onDeleteTask: (id: string) => Promise<void>;
  onDeleteColumn: (id: string) => void;
  loading?: boolean;
  activeTaskId?: string | null;
  addTaskError?: { [columnId: string]: string };
  handleAddTask?: (columnId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  // Для модалки удаления таска
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Сбросить локальное состояние названия при изменении пропса
  useEffect(() => { setTitle(column.title); }, [column.title]);

  // Сбросить taskToDelete, если таск уже удалён
  useEffect(() => {
    if (taskToDelete && !tasks.some(t => t.id === taskToDelete)) {
      setTaskToDelete(null);
    }
  }, [taskToDelete, tasks]);

  // Сохранить новое название
  function handleRename() {
    const safeTitle = title.trim() === '' ? 'Не может быть пустым!' : title;
    if (safeTitle !== column.title) {
      // Переименование колонки делается через пропсы (BoardView)
      // onRename(column.id, safeTitle); // убрано, теперь только для задач
    }
    setIsEditing(false);
  }

  return (
    <div className="bg-gray-300 rounded shadow p-4 w-64 mr-4 flex-shrink-0 opacity-100">
      <div className="flex items-center mb-2">
        {/* Кнопка-карандаш удалена, теперь редактирование по двойному клику */}
        {isEditing ? (
          <input
            className="w-24 mr-2 text-sm font-semibold text-gray-800 truncate select-text hover:cursor-text bg-transparent outline-none border-none focus:ring-0"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
            autoFocus
            disabled={loading}
          />
        ) : (
          <span
            className="font-semibold text-gray-800 flex-1 select-text hover:cursor-text"
            onDoubleClick={() => setIsEditing(true)}
            title="Двойной клик для редактирования названия колонки"
            style={{ cursor: 'text' }}
          >
            {column.title}
          </span>
        )}
        {/* Кнопка-крестик для удаления */}
        {/* onDelete теперь передается из BoardView */}
        <button className="ml-auto text-red-500" onClick={() => onDeleteColumn(column.id)} title="Удалить" disabled={loading}>
          ❌
        </button>
      </div>
      {/* Кнопка "Добавить таск" всегда над списком */}
      <div className="flex flex-col mb-2">
        <button
          className={`bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded mb-2 transition-colors ${addTaskError && addTaskError[column.id] ? 'bg-red-600 hover:bg-red-700' : ''}`}
          onClick={() => handleAddTask && handleAddTask(column.id)}
          disabled={loading}
        >
          {addTaskError && addTaskError[column.id] ? addTaskError[column.id] : '+ Добавить таск'}
        </button>
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.sort((a: TaskType, b: TaskType) => b.order - a.order).map(task => (
            <DraggableTask
              key={task.id}
              task={task}
              onRename={onRenameTask}
              onDelete={() => setTaskToDelete(task.id)}
              onEditDesc={onEditDesc}
              loading={loading}
            />
          ))}
        </SortableContext>
      </div>
      {/* Модалка подтверждения удаления таска */}
      <Dialog open={!!taskToDelete} onClose={() => setTaskToDelete(null)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-2">
            Удалить задачу{taskToDelete ? `: "${(tasks.find(t => t.id === taskToDelete)?.title || '')}"` : ''}?
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-200">
            {taskToDelete ? `Вы уверены, что хотите удалить задачу "${(tasks.find(t => t.id === taskToDelete)?.title || '')}"? Это действие необратимо.` : 'Это действие необратимо.'}
          </Dialog.Description>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded" onClick={() => setTaskToDelete(null)} disabled={loading}>Отмена</button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              onClick={async () => {
                if (taskToDelete) {
                  await onDeleteTask(taskToDelete);
                  setTaskToDelete(null);
                }
              }}
              disabled={loading}
            >
              {loading ? "Удаление..." : "Удалить"}
            </button>
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
  // Все задачи для всех колонок
  const [tasks, setTasks] = useState<TaskType[]>([]);
  // Название для новой колонки
  const [newColTitle, setNewColTitle] = useState("");
  // Флаг загрузки/операций
  const [loading, setLoading] = useState(false);
  // id колонки, которую хотим удалить (для модалки)
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  // Состояния ошибок для кнопок
  const [addColumnError, setAddColumnError] = useState<string>("");
  const [addTaskError, setAddTaskError] = useState<{ [columnId: string]: string }>({});

  // DND state
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Загрузка колонок и задач с сервера при смене доски
  useEffect(() => {
    let ignore = false;
    async function fetchColumnsAndTasks() {
      setLoading(true);
      const resCols = await fetch(`/api/columns?boardId=${board.id}`);
      let columnsData = [];
      if (resCols.ok) {
        const data = await resCols.json();
        columnsData = data.columns;
        if (!ignore) setColumns(columnsData);
      }
      // Загружаем задачи для всех колонок
      const allTasks: TaskType[] = [];
      for (const col of columnsData) {
        const resTasks = await fetch(`/api/tasks?columnId=${col.id}`);
        if (resTasks.ok) {
          const data = await resTasks.json();
          // Добавляем columnId вручную к каждой задаче
          allTasks.push(...data.tasks.map((t: any) => ({ ...t, columnId: col.id })));
        }
      }
      if (!ignore) setTasks(allTasks);
      setLoading(false);
    }
    fetchColumnsAndTasks();
    return () => { ignore = true; };
  }, [board.id]);

  // Создать новую колонку через API
  async function handleAddColumn() {
    if (!newColTitle.trim()) return;
    setLoading(true);
    setAddColumnError("");
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: board.id, title: newColTitle })
    });
    if (res.ok) {
      setNewColTitle("");
      const data = await res.json();
      setColumns(cols => [...cols, data.column]);
      setAddColumnError("");
    } else {
      const err = await res.json();
      setAddColumnError(err.error || 'Ошибка при создании колонки');
    }
    setLoading(false);
  }

  // Переименовать колонку через API
  async function handleRenameColumn(id: string, title: string) {
    setLoading(true);
    const safeTitle = title.trim() === '' ? 'Не может быть пустым!' : title;
    const res = await fetch('/api/columns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: safeTitle })
    });
    if (res.ok) {
      setColumns(cols => cols.map(c => c.id === id ? { ...c, title: safeTitle } : c));
    }
    setLoading(false);
  }

  // Удалить колонку через API (после подтверждения)
  async function handleDeleteColumn(id: string) {
    setLoading(true);
    const res = await fetch(`/api/columns?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setColumns(cols => cols.filter(c => c.id !== id));
      setTasks(ts => ts.filter(t => t.columnId !== id));
    }
    setLoading(false);
    setColumnToDelete(null);
  }

  // --- Методы для задач ---
  async function handleAddTask(columnId: string) {
    setLoading(true);
    setAddTaskError(prev => ({ ...prev, [columnId]: "" }));
    const newOrder = tasks.filter(t => t.columnId === columnId).length + 1;
    const column = columns.find(c => c.id === columnId);
    const columnTitle = column ? column.title : '';
    const taskTitle = `Новый ${columnTitle} ${newOrder}`;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, order: newOrder, title: taskTitle })
    });
    if (res.ok) {
      const data = await fetch(`/api/tasks?columnId=${columnId}`);
      if (data.ok) {
        const json = await data.json();
        setTasks(ts => [
          ...ts.filter(t => t.columnId !== columnId),
          ...json.tasks.map((t: any) => ({ ...t, columnId }))
        ]);
        setAddTaskError(prev => ({ ...prev, [columnId]: "" }));
      }
    } else {
      const err = await res.json();
      setAddTaskError(prev => ({ ...prev, [columnId]: err.error || 'Ошибка при создании задачи' }));
    }
    setLoading(false);
  }
  async function handleRenameTask(id: string, title: string) {
    setLoading(true);
    const safeTitle = title.trim() === '' ? 'Не может быть пустым!' : title;
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: safeTitle })
    });
    if (res.ok) {
      setTasks(ts => ts.map(t => t.id === id ? { ...t, title: safeTitle } : t));
    }
    setLoading(false);
  }
  async function handleEditDesc(id: string, description: string) {
    setLoading(true);
    const safeDesc = description.trim() === '' ? 'Не может быть пустым!' : description;
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, description: safeDesc })
    });
    if (res.ok) {
      setTasks(ts => ts.map(t => t.id === id ? { ...t, description: safeDesc } : t));
    }
    setLoading(false);
  }
  async function handleDeleteTask(id: string) {
    setLoading(true);
    // Получаем columnId для фильтрации
    const task = tasks.find(t => t.id === id);
    const columnId = task?.columnId;
    const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    if (res.ok && columnId) {
      // После удаления пересортируем order
      const data = await fetch(`/api/tasks?columnId=${columnId}`);
      if (data.ok) {
        const json = await data.json();
        setTasks(ts => [
          ...ts.filter(t => t.columnId !== columnId),
          ...json.tasks.map((t: any) => ({ ...t, columnId }))
        ]);
      } else {
        setTasks(ts => ts.filter(t => t.id !== id));
      }
    }
    setLoading(false);
  }

  // Получить таск по id
  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  // DND обработчик
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over || active.id === over.id) return;
    // Найти таск и колонку
    const activeTask = getTaskById(active.id as string);
    const overTask = getTaskById(over.id as string);
    if (!activeTask || !overTask) return;
    // Если таск перемещен в другую колонку или внутри колонки
    const fromColumnId = activeTask.columnId;
    const toColumnId = overTask.columnId;
    // Получить таски в целевой колонке
    const targetTasks = tasks.filter(t => t.columnId === toColumnId).sort((a, b) => b.order - a.order);
    // Найти индекс вставки
    const overIndex = targetTasks.findIndex(t => t.id === overTask.id);
    // Переместить таск в массиве
    let newTasks: TaskType[] = [];
    let fromTasks: TaskType[] = [];
    if (fromColumnId === toColumnId) {
      // Внутри одной колонки
      const oldTasks = targetTasks;
      const activeIndex = oldTasks.findIndex(t => t.id === activeTask.id);
      newTasks = arrayMove(oldTasks, activeIndex, overIndex);
      // Обновить order
      newTasks = newTasks.map((t, idx) => ({ ...t, order: newTasks.length - idx }));
      setTasks(ts => [
        ...ts.filter(t => t.columnId !== toColumnId),
        ...newTasks
      ]);
    } else {
      // Между колонками
      fromTasks = tasks.filter(t => t.columnId === fromColumnId).sort((a, b) => b.order - a.order).filter(t => t.id !== activeTask.id);
      newTasks = [
        ...targetTasks.slice(0, overIndex),
        { ...activeTask, columnId: toColumnId },
        ...targetTasks.slice(overIndex)
      ].map((t, idx) => ({ ...t, order: targetTasks.length + 1 - idx }));
      setTasks(ts => [
        ...ts.filter(t => t.columnId !== fromColumnId && t.columnId !== toColumnId),
        ...fromTasks.map((t, idx) => ({ ...t, order: fromTasks.length - idx })),
        ...newTasks
      ]);
    }
    // Сохраняем изменения на сервере для всех затронутых тасков
    // 1. Собираем все таски, у которых изменился order или columnId
    const prevTasks = tasks;
    const changedTasks: TaskType[] = [];
    // Добавляем таски из newTasks (целевая колонка)
    for (const t of newTasks) {
      const prev = prevTasks.find(pt => pt.id === t.id);
      if (!prev || prev.order !== t.order || prev.columnId !== t.columnId) {
        changedTasks.push(t);
      }
    }
    // Если между колонками — добавляем таски из fromTasks (исходная колонка)
    if (fromColumnId !== toColumnId) {
      for (const t of fromTasks) {
        const prev = prevTasks.find(pt => pt.id === t.id);
        if (!prev || prev.order !== t.order || prev.columnId !== t.columnId) {
          changedTasks.push(t);
        }
      }
    }
    // 2. PATCH для всех изменённых тасков
    Promise.all(
      changedTasks.map(t =>
        fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: t.id, order: t.order, columnId: t.columnId })
        })
      )
    ).then(async () => {
      // 3. После успешного сохранения — перезагружаем таски для обеих колонок
      const reloadColumnIds = Array.from(new Set([fromColumnId, toColumnId]));
      let allNewTasks: TaskType[] = tasks.filter(t => !reloadColumnIds.includes(t.columnId));
      for (const colId of reloadColumnIds) {
        const data = await fetch(`/api/tasks?columnId=${colId}`);
        if (data.ok) {
          const json = await data.json();
          allNewTasks = [
            ...allNewTasks,
            ...json.tasks.map((t: any) => ({ ...t, columnId: colId }))
          ];
        }
      }
      setTasks(allNewTasks);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={e => setActiveTaskId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTaskId(null)}
    >
      <section className="flex-1 overflow-x-auto pl-8 pr-8">
        <h1 className="text-xl font-bold mb-4">Ваши доски &gt; {board.name}</h1>
        {/* Форма создания новой колонки */}
        <div className="flex items-end mb-4">
          <input
            className="border rounded px-2 py-1 mr-2"
            placeholder="Новая колонка"
            value={newColTitle}
            onChange={(e) => {
              setNewColTitle(e.target.value);
              setAddColumnError("");
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); }}
            disabled={loading}
          />
          <button
            className={`px-3 py-1 rounded ${addColumnError ? 'bg-red-600 text-white' : 'bg-blue-500 text-white'}`}
            onClick={handleAddColumn}
            disabled={loading}
          >
            {addColumnError ? addColumnError : '+ Добавить колонку'}
          </button>
        </div>
        {/* Список колонок */}
        <div className="flex">
          {columns.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.columnId === col.id)}
              onAddTask={handleAddTask}
              onRenameTask={handleRenameTask}
              onEditDesc={handleEditDesc}
              onDeleteTask={handleDeleteTask}
              onDeleteColumn={setColumnToDelete}
              loading={loading}
              activeTaskId={activeTaskId}
              addTaskError={addTaskError}
              handleAddTask={handleAddTask}
            />
          ))}
        </div>
        {/* DragOverlay для таска */}
        <DragOverlay>
          {activeTaskId ? (
            <SortableTask
              task={getTaskById(activeTaskId)!}
              onRename={() => {}}
              onDelete={() => {}}
              onEditDesc={() => {}}
              loading={true}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
        {/* Модалка подтверждения удаления колонки */}
        <Dialog open={!!columnToDelete} onClose={() => setColumnToDelete(null)} className="fixed z-50 inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-sm w-full">
            <Dialog.Title className="text-lg font-bold mb-2">
              Удалить колонку{columnToDelete ? `: "${(columns.find(c => c.id === columnToDelete)?.title || '')}"` : ''}?
            </Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-200">
              {columnToDelete ? `Вы уверены, что хотите удалить колонку "${(columns.find(c => c.id === columnToDelete)?.title || '')}"? Это действие необратимо.` : 'Это действие необратимо.'}
            </Dialog.Description>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded" onClick={() => setColumnToDelete(null)} disabled={loading}>Отмена</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50" onClick={() => columnToDelete && handleDeleteColumn(columnToDelete)} disabled={loading}>{loading ? "Удаление..." : "Удалить"}</button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </section>
    </DndContext>
  );
}

// Инструкция для Sidebar:
// Чтобы реализовать редактирование названия Board по двойному клику, в компоненте Sidebar:
// - Уберите кнопку-карандаш для редактирования названия доски.
// - Сделайте так, чтобы название доски (Board) редактировалось по двойному клику (onDoubleClick) на текст.
// - При наведении на название доски должен быть cursor: text (например, className="hover:cursor-text select-text").
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
      <div className="flex flex-col">
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
      </div>
    </main>
  );
} 