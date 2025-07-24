"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { io, Socket } from "socket.io-client";

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
  const [messages, setMessages] = useState<{ senderId: string; receiverId: string; text: string; timestamp?: string }[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false); // собеседник печатает
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  // Счетчики непрочитанных сообщений
  const [unread, setUnread] = useState<{ [userId: string]: number }>({});
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [loadingDeleteChat, setLoadingDeleteChat] = useState(false);

  // Подключение к socket.io серверу + онлайн-статусы
  useEffect(() => {
    const socket = io("ws://localhost:4000");
    socketRef.current = socket;
    // Сообщаем серверу свой userId
    socket.emit('login', { userId });
    // Принимаем онлайн/оффлайн события
    function handleOnline({ userId }: { userId: string }) {
      setOnlineUsers(prev => new Set(prev).add(userId));
    }
    function handleOffline({ userId }: { userId: string }) {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
    socket.on('user online', handleOnline);
    socket.on('user offline', handleOffline);
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [userId]);

  // Увеличивать счетчик, если пришло новое сообщение и чат не выбран
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    function onMessage(msg: { senderId: string; receiverId: string; text: string; timestamp?: string }) {
      setMessages((prev) => [...prev, msg]);
      // Если чат не выбран или выбран другой чат, увеличиваем счетчик
      if (msg.receiverId === userId && msg.senderId !== selectedUserId) {
        setUnread(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
      }
    }
    socket.on("chat message", onMessage);
    return () => {
      socket.off("chat message", onMessage);
    };
  }, [selectedUserId, userId]);

  // Сброс счетчика при открытии чата
  useEffect(() => {
    if (selectedUserId) {
      setUnread(prev => ({ ...prev, [selectedUserId]: 0 }));
    }
  }, [selectedUserId]);

  // Глобальный счетчик для Header (через кастомное событие)
  useEffect(() => {
    const total = Object.values(unread).reduce((a, b) => a + b, 0);
    window.dispatchEvent(new CustomEvent('chats-unread', { detail: total }));
  }, [unread]);

  // Отправка сообщения через сокет
  function sendSocketMessage(receiverId: string, text: string) {
    if (socketRef.current) {
      socketRef.current.emit("chat message", { senderId: userId, receiverId, text, timestamp: Date.now() });
    }
  }

  // Фильтрация пользователей по поиску
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [search, allUsers]);

  // Фильтрация пользователей по поиску и отсутствию чата
  const filteredNewChatUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Только те, с кем еще нет чата
    const notInChat = allUsers.filter(u => !chatUserList.some(cu => cu.id === u.id));
    if (!q) return notInChat;
    return notInChat.filter(u =>
      (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [search, allUsers, chatUserList]);

  // Переключение выбора пользователя
  function toggleUser(id: string) {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  }

  // TODO: отправка приветственного сообщения
  async function handleStartChat() {
    await Promise.all(selectedUserIds.map(async (receiverId) => {
      // API для истории
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content: '👋' }),
      });
      // Live через сокет
      sendSocketMessage(receiverId, '��');
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

  const [input, setInput] = useState("");
  function handleSendMessage() {
    if (!selectedUserId || !input.trim()) return;
    // API для истории
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: selectedUserId, content: input }),
    });
    // Live через сокет
    sendSocketMessage(selectedUserId, input);
    setInput("");
  }

  // Отправка события 'typing' при вводе текста
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (socketRef.current && selectedUserId) {
      socketRef.current.emit('typing', { from: userId, to: selectedUserId });
    }
  }

  // Приём события 'typing' от собеседника
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    function onTyping({ from, to }: { from: string; to: string }) {
      if (from === selectedUserId && to === userId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
      }
    }
    socket.on('typing', onTyping);
    return () => {
      socket.off('typing', onTyping);
    };
  }, [selectedUserId, userId]);

  // Авто-скролл вниз при новых сообщениях
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUserId]);

  // Подгрузка истории сообщений при выборе собеседника
  useEffect(() => {
    if (!selectedUserId) return;
    fetch(`/api/messages?userId=${selectedUserId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      });
  }, [selectedUserId]);

  return (
    <main className="p-8 flex h-[80vh]">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-64 bg-gray-300 dark:bg-gray-900 p-4 rounded shadow flex flex-col self-start">
          <div className="flex items-center mb-4">
            <button
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
              onClick={() => setShowSidebar(false)}
            >
              Скрыть чаты
            </button>
          </div>
          <div className="w-full mb-4">
            <button
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white dark:text-white rounded hover:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
              onClick={() => setShowNewChatModal(true)}
            >
              Новый чат
            </button>
          </div>
          <ul className="space-y-2">
            {chatUserList.map((user) => (
              <li key={user.id} className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <button
                  className={`flex-1 text-left px-2 py-1 rounded transition-colors cursor-pointer ${selectedUserId === user.id ? 'bg-blue-400 dark:bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.name || user.email}
                  {unread[user.id] > 0 && (
                    <span className="ml-2 inline-block bg-red-500 text-white text-xs rounded-full px-2 py-0.5 align-middle">{unread[user.id]}</span>
                  )}
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
      <section className="flex-1 flex flex-col pl-8 pr-8">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Ваши чаты
        {selectedUserId && (
          <> &gt; Чат с {chatUserList.find(u => u.id === selectedUserId)?.name || chatUserList.find(u => u.id === selectedUserId)?.email}</>
        )}
      </h1>
        {selectedUserId ? (
          <div className="flex-1 flex flex-col">
            {/* Кнопка удаления чата */}
            <div className="flex justify-end mb-2">
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm cursor-pointer"
                onClick={() => setShowDeleteChatModal(true)}
              >Удалить чат</button>
            </div>
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded p-2">
              {messages.filter(m => (m.senderId === userId && m.receiverId === selectedUserId) || (m.senderId === selectedUserId && m.receiverId === userId)).map((msg, idx) => (
                <div key={idx} className={`mb-2 flex flex-col ${msg.senderId === userId ? 'items-end' : 'items-start'}`}>
                  <span className={`inline-block px-3 py-1 rounded ${msg.senderId === userId ? 'bg-blue-500 text-white dark:text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'}`}>{msg.text}</span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
              {/* Индикатор "печатает..." */}
              {isTyping && (
                <div className="text-xs text-gray-300 mt-1 ml-2">Печатает...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Форма отправки */}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400"
                placeholder="Сообщение..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!input.trim()}
              >Отправить</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Выберите чат слева</div>
        )}
      </section>
      {/* Модалка создания нового чата */}
      <Dialog open={showNewChatModal} onClose={() => setShowNewChatModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
          <Dialog.Title className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Новый чат</Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-700 dark:text-gray-300">Выберите пользователей для нового чата</Dialog.Description>
          <input
            className="w-full mb-3 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            placeholder="Поиск по имени или email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto mb-4 bg-gray-200 dark:bg-gray-800 rounded p-2 custom-scrollbar">
            {filteredNewChatUsers.length === 0 ? (
              <div className="text-gray-400 text-sm">Нет пользователей</div>
            ) : (
              <ul className="space-y-1">
                {filteredNewChatUsers.map(user => (
                  <li key={user.id}>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100">
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
            <button className="px-4 py-2 bg-gray-400 dark:bg-gray-500 hover:bg-gray-300 dark:hover:bg-gray-400 text-gray-900 dark:text-gray-100 rounded" onClick={() => setShowNewChatModal(false)}>Отмена</button>
            <button
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white dark:text-white rounded disabled:opacity-50"
              disabled={selectedUserIds.length === 0}
              onClick={handleStartChat}
            >
              Начать чат
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
      {/* Модалка подтверждения удаления чата */}
      <Dialog open={showDeleteChatModal} onClose={() => setShowDeleteChatModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded shadow-xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
          <Dialog.Title className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
            Удалить чат
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-700 dark:text-gray-300">
            Вы уверены, что хотите удалить все сообщения с этим пользователем? Это действие необратимо.
          </Dialog.Description>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded" onClick={() => setShowDeleteChatModal(false)} disabled={loadingDeleteChat}>Отмена</button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 dark:bg-red-700"
              onClick={async () => {
                if (!selectedUserId) return;
                setLoadingDeleteChat(true);
                await fetch(`/api/messages?userId=${selectedUserId}`, { method: 'DELETE' });
                setSelectedUserId(null);
                // Обновить список чатов
                const res = await fetch('/api/chats/users');
                if (res.ok) {
                  const data = await res.json();
                  setChatUserList(data.chatUsers);
                }
                setMessages([]);
                setShowDeleteChatModal(false);
                setLoadingDeleteChat(false);
              }}
              disabled={loadingDeleteChat}
            >
              {loadingDeleteChat ? "Удаление..." : "Удалить"}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </main>
  );
} 