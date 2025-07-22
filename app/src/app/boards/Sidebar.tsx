"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function Sidebar({ boards, userId, onBoardCreated, onBoardDeleted }: {
  boards: { id: string, name: string }[];
  userId: string;
  onBoardCreated: () => void;
  onBoardDeleted: (id: string) => void;
}) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCreateBoard() {
    setCreating(true);
    await fetch("/api/boards", { method: "POST" });
    setCreating(false);
    onBoardCreated();
  }

  async function handleDeleteBoard() {
    if (!boardToDelete) return;
    setDeleting(true);
    await fetch(`/api/boards?id=${boardToDelete}`, { method: "DELETE" });
    setDeleting(false);
    setShowModal(false);
    onBoardDeleted(boardToDelete);
    setBoardToDelete(null);
  }

  return (
    <>
      {showSidebar && (
        <aside className="w-64 bg-gray-800 p-4 rounded shadow flex flex-col">
          <div className="flex items-center mb-4">
            <div className="w-full min-w-[120px]">
              <button
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600"
                onClick={() => setShowSidebar((v) => !v)}
              >
                Скрыть доски
              </button>
            </div>
          </div>
          <div className="w-full min-w-[120px] mb-4">
            <button
              className="w-full px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={handleCreateBoard}
              disabled={creating}
            >
              {creating ? "Создание..." : "Новая доска"}
            </button>
          </div>
          <ul className="space-y-2">
            {boards.map((board) => (
              <li
                key={board.id}
                className="flex items-center justify-between group cursor-pointer rounded hover:bg-gray-700 transition-colors duration-150"
              >
                <span className="ml-2 truncate text-gray-100">{board.name}</span>
                <button
                  className="ml-2 mr-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                  onClick={() => { setBoardToDelete(board.id); setShowModal(true); }}
                  aria-label="Удалить доску"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {!showSidebar && (
        <div className="flex items-center mb-4">
          <div className="w-full min-w-[120px]">
            <button
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600"
              onClick={() => setShowSidebar((v) => !v)}
            >
              Показать доски
            </button>
          </div>
        </div>
      )}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-2 text-gray-100">Удалить доску?</Dialog.Title>
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