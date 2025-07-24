# TaskForge

Минималистичный Trello-клон с мессенджером и real-time взаимодействием.

## Цель проекта
Пользователь может:
- Управлять своими задачами
- Общаться с другими пользователями
- Работать в светлой/тёмной теме
- Использовать всё с мобильного устройства

---

## 🧱 Архитектура и технологии

### 💡 Frontend:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- DND-kit — drag-and-drop для карточек
- Socket.IO (client API)

### 🗄️ Backend:
- Next.js API routes
- Prisma + PostgreSQL
- Socket.IO (отдельный сервер)
- Реализация чатов через WebSocket-события

---

## 🔁 Пользовательский флоу
- Регистрация / логин
- Создание доски, добавление колонок и задач
- Перетаскивание задач между колонками
- Чат с другими пользователями (чат-иконка в хедере)
- Настройка темы (тёмная / светлая)

---

## 📚 Основные роуты

### Страницы
- `/` — Главная (приветствие, вход/регистрация)
- `/login` — Вход
- `/register` — Регистрация
- `/boards` — Список досок
- `/chats` — Чаты

### API-роуты
- `/api/login` — POST: вход
- `/api/logout` — POST: выход
- `/api/register` — POST: регистрация
- `/api/boards` — GET/POST/PUT/DELETE: доски
- `/api/columns` — GET/POST/PUT/DELETE: колонки
- `/api/tasks` — GET/POST/PUT/DELETE: задачи
- `/api/chats` — GET/POST: чаты
- `/api/chats/users` — GET: пользователи для чата
- `/api/messages` — GET/POST: сообщения
