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
- Tailwind CSS + shadcn/ui
- Zustand или React Query
- DND-kit — drag-and-drop для карточек
- Socket.IO (через client API) или Ably для чатов
- Next Auth (email/pass или OAuth)

### 🗄️ Backend:
- Next.js API routes (или Server Actions)
- Prisma + PostgreSQL (или Supabase)
- Socket.IO (через API route / отдельный сервер)
- Реализация чатов и досок через WebSocket-события

### ⚙️ Dev Tools:
- ESLint + Prettier
- GitHub Actions / Husky
- Vercel CI/CD
- Jest / React Testing Library (если хочешь покрыть критические фичи)

---

## 🔁 Пользовательский флоу
- Регистрация / логин
- Создание доски → "/dashboard/:id"
- Добавление колонок / задач
- Перетаскивание задач между колонками
- Чат с другими пользователями (чат-иконка в хедере)
- Настройка темы (тёмная / светлая)
