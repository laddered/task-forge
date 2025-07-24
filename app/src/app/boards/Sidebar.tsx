"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function Sidebar({ boards, userId, onBoardCreated, onBoardDeleted, onBoardRenamed, selectedBoardId, onSelectBoard }: {
  boards: { id: string, name: string }[];
  userId: string;
  onBoardCreated: () => void;
  onBoardDeleted: (id: string) => void;
  onBoardRenamed?: (id: string, name: string) => void;
  selectedBoardId: string;
  onSelectBoard: (id: string) => void;
}) {
  // Состояния для управления UI
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Состояния для редактирования названия доски
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = useState<string>("");
  const [renameError, setRenameError] = useState<string>("");
  // Максимальное количество досок
  const MAX_BOARDS = 10;

  // Создание новой доски
  async function handleCreateBoard() {
    setCreating(true);
    await fetch("/api/boards", { method: "POST" });
    setCreating(false);
    onBoardCreated();
  }

  // Удаление доски
  async function handleDeleteBoard() {
    if (!boardToDelete) return;
    setDeleting(true);
    await fetch(`/api/boards?id=${boardToDelete}`, { method: "DELETE" });
    setDeleting(false);
    setShowModal(false);
    onBoardDeleted(boardToDelete);
    setBoardToDelete(null);
  }

  // Переименование доски (PATCH-запрос)
  async function handleRenameBoard(boardId: string, newName: string) {
    setRenameError("");
    const safeName = newName.trim() === '' ? 'Не может быть пустым!' : newName;
    try {
      const res = await fetch("/api/boards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: boardId, name: safeName })
      });
      if (!res.ok) {
        const data = await res.json();
        setRenameError(data.error || "Ошибка при сохранении");
        return;
      }
      if (typeof onBoardRenamed === 'function') {
        onBoardRenamed(boardId, safeName);
      }
    } catch (e) {
      setRenameError("Ошибка сети");
    }
  }

  return (
    <>
      {/* Боковая панель со списком досок */}
      {showSidebar && (
        <aside className="w-64 bg-gray-300 dark:bg-gray-900 p-4 rounded shadow flex flex-col self-start">
          <div className="flex items-center mb-4">
            <div className="w-full min-w-[120px]">
              {/* Кнопка скрытия боковой панели */}
              <button
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => setShowSidebar((v) => !v)}
              >
                Скрыть доски
              </button>
            </div>
          </div>
          <div className="w-full min-w-[120px] mb-4">
            {/* Кнопка создания новой доски */}
            <button
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
              onClick={handleCreateBoard}
              disabled={creating || boards.length >= MAX_BOARDS}
            >
              {boards.length >= MAX_BOARDS ? "Максимум 10 досок" : creating ? "Создание..." : "Новая доска"}
            </button>
          </div>
          {/* Список досок */}
          <ul className="space-y-2">
            {boards.map((board) => (
              <li
                key={board.id}
                className={`flex items-center justify-between group cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ${selectedBoardId === board.id ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
                onClick={() => onSelectBoard(board.id)}
              >
                {/* Кнопка-карандаш удалена. Теперь редактирование по двойному клику на название */}
                {editingBoardId === board.id ? (
                  <input
                    className="ml-2 truncate text-gray-900 dark:text-gray-100 select-text hover:cursor-text w-32 bg-transparent outline-none border-none focus:ring-0"
                    value={editingBoardName}
                    maxLength={20}
                    autoFocus
                    onChange={e => setEditingBoardName(e.target.value)}
                    onBlur={() => setEditingBoardId(null)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        await handleRenameBoard(board.id, editingBoardName);
                        setEditingBoardId(null);
                      }
                    }}
                  />
                ) : renameError && editingBoardId === board.id ? (
                  // Отображение ошибки при переименовании
                  <span className="ml-2 text-red-400 text-xs">{renameError}</span>
                ) : (
                  // Название доски (двойной клик для редактирования)
                  <span
                    className="ml-2 truncate text-gray-900 dark:text-gray-100 select-text hover:cursor-text"
                    onDoubleClick={e => { e.stopPropagation(); setEditingBoardId(board.id); setEditingBoardName(board.name); }}
                    title="Двойной клик для редактирования названия"
                    style={{ cursor: 'text' }}
                  >
                    {board.name}
                  </span>
                )}
                {/* Кнопка удаления доски */}
                <button
                  className="ml-2 mr-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  onClick={e => { e.stopPropagation(); setBoardToDelete(board.id); setShowModal(true); }}
                  aria-label="Удалить доску"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {/* Кнопка для показа боковой панели, если она скрыта */}
      {!showSidebar && (
        <div className="flex items-center mb-4 justify-center">
          <button
            className="px-2 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 flex items-center justify-center cursor-pointer"
            onClick={() => setShowSidebar((v) => !v)}
            style={{ minWidth: 0, width: '40px', height: '40px' }}
          >
            <span className="flex items-center justify-center" title="Показать доски">
              <svg width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M2 2L16 16L2 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      )}
      {/* Модальное окно подтверждения удаления доски */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-2 text-gray-100">
            Удалить доску{boardToDelete ? `: "${boards.find(b => b.id === boardToDelete)?.name || ''}"` : ''}?
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-200">Вы уверены, что хотите удалить эту доску? Это действие необратимо.</Dialog.Description>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-gray-100 rounded" onClick={() => setShowModal(false)} disabled={deleting}>Отмена</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50" onClick={handleDeleteBoard} disabled={deleting}>{deleting ? "Удаление..." : "Удалить"}</button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
} 