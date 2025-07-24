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

## 🚀 Быстрый старт с Docker

1. Установите зависимости во всех контейнерах:
   - Для каждого сервиса (nextjs, prisma, socket) выполните:
     ```sh
     docker compose run --rm <service> npm install
     ```
     Например:
     ```sh
     docker compose run --rm nextjs npm install
     docker compose run --rm prisma npm install
     docker compose run --rm socket npm install
     ```
2. Примените миграции к базе данных:
   ```sh
   docker compose run --rm prisma npx prisma migrate deploy
   ```

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

---

## 🐳 Запуск с помощью docker-compose

1. Соберите и запустите все сервисы:
   ```sh
   docker-compose up --build
   ```
   или в фоне:
   ```sh
   docker-compose up -d --build
   ```

2. Остановить сервисы:
   ```sh
   docker-compose down
   ```

3. Для ручной настройки или отладки можно раскомментировать строку
   ```Dockerfile
   # CMD ["sh", "-c", "tail -f /dev/null"]
   ```
   в нужном Dockerfile. Тогда контейнер будет работать в режиме ожидания и не завершится, пока вы не завершите его вручную. Это удобно для входа внутрь контейнера и выполнения команд вручную.

4. (Рекомендуется) Перед первым запуском выполните установку зависимостей и миграции, как указано выше.

---
