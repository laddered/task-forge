"use client";
import { useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";

interface ChatUser {
  id: string;
  name: string | null;
  email: string;
}

interface ClientChatsProps {
  chatUsers: ChatUser[];
  userId: string;
  allUsers: ChatUser[];
}

export default function ClientChats({ chatUsers, userId, allUsers }: ClientChatsProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [chatUserList, setChatUserList] = useState<ChatUser[]>(chatUsers);

  // Фильтрация пользователей по поиску
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [search, allUsers]);

  // Переключение выбора пользователя
  function toggleUser(id: string) {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  }

  // TODO: отправка приветственного сообщения
  async function handleStartChat() {
    // Отправить 👋 каждому выбранному пользователю
    await Promise.all(selectedUserIds.map(async (receiverId) => {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content: '👋' }),
      });
    }));
    // Обновить список чатов
    const res = await fetch('/api/chats/users');
    if (res.ok) {
      const data = await res.json();
      setChatUserList(data.chatUsers);
    }
    setShowNewChatModal(false);
    setSelectedUserIds([]);
    setSearch("");
  }

  return (
    <main className="p-8 flex h-[80vh]">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-64 bg-gray-800 p-4 rounded shadow flex flex-col mr-8">
          <div className="flex items-center mb-4">
            <button
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 cursor-pointer"
              onClick={() => setShowSidebar(false)}
            >
              Скрыть чаты
            </button>
          </div>
          <div className="w-full mb-4">
            <button
              className="w-full px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 cursor-pointer"
              onClick={() => setShowNewChatModal(true)}
            >
              Новый чат
            </button>
          </div>
          <ul className="space-y-2">
            {chatUserList.map((user) => (
              <li key={user.id}>
                <button
                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-700 transition-colors ${selectedUserId === user.id ? 'bg-gray-700 text-white' : 'text-gray-200'}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.name || user.email}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {!showSidebar && (
        <div className="flex items-center mb-4 justify-center">
          <button
            className="px-2 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 flex items-center justify-center cursor-pointer"
            onClick={() => setShowSidebar(true)}
            style={{ minWidth: 0, width: '40px', height: '40px' }}
          >
            <span className="flex items-center justify-center" title="Показать чаты">
              <svg width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M2 2L16 16L2 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      )}
      {/* Chat window */}
      <section className="flex-1 bg-white rounded shadow p-6 flex flex-col">
        {selectedUserId ? (
          <div className="flex-1 flex flex-col">
            <div className="font-bold mb-2">Чат с {chatUsers.find(u => u.id === selectedUserId)?.name || chatUsers.find(u => u.id === selectedUserId)?.email}</div>
            {/* Здесь будет окно сообщений и форма отправки */}
            <div className="flex-1 flex items-center justify-center text-gray-400">Live chat coming soon...</div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Выберите чат слева</div>
        )}
      </section>
      {/* Модалка создания нового чата */}
      <Dialog open={showNewChatModal} onClose={() => setShowNewChatModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-gray-800 p-6 rounded shadow-xl max-w-md w-full">
          <Dialog.Title className="text-lg font-bold mb-2 text-gray-100">Новый чат</Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-200">Выберите пользователей для нового чата</Dialog.Description>
          <input
            className="w-full mb-3 px-3 py-2 rounded border border-gray-400 focus:outline-none focus:ring"
            placeholder="Поиск по имени или email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto mb-4 bg-gray-700 rounded p-2">
            {filteredUsers.length === 0 ? (
              <div className="text-gray-300 text-sm">Нет пользователей</div>
            ) : (
              <ul className="space-y-1">
                {filteredUsers.map(user => (
                  <li key={user.id}>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="accent-blue-500"
                      />
                      <span>{user.name || user.email}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-gray-100 rounded" onClick={() => setShowNewChatModal(false)}>Отмена</button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={selectedUserIds.length === 0}
              onClick={handleStartChat}
            >
              Начать чат
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </main>
  );
} 