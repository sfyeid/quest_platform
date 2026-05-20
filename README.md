# 🗺️ Quest Platform

Платформа для создания и прохождения интерактивных квестов в городе.

Курсовая работа по дисциплине «Разработка клиент-серверных приложений»  
Студент: Петрушкин Данила Олегович, ИКБО-15-23, РТУ МИРЭА, 2026

---

## Стек технологий

| Слой | Технология |
|------|------------|
| Backend | Node.js 20, TypeScript, Express |
| WebSocket | ws (RFC 6455) |
| ORM | Prisma |
| Database | PostgreSQL 15 + PostGIS |
| Frontend | React 18, TypeScript, Vite |
| Карты | Leaflet.js + OpenStreetMap |
| Контейнеризация | Docker, Docker Compose |
| Reverse proxy | NGINX |
| Аутентификация | JWT (jsonwebtoken) |

---

## Структура проекта

```
quest_platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Схема БД
│   │   └── migrations/            # SQL-миграции
│   ├── src/
│   │   ├── config/                # JWT, Prisma client
│   │   ├── controllers/           # HTTP-обработчики
│   │   ├── middleware/            # Auth, error handling
│   │   ├── repositories/          # Слой доступа к данным (Repository pattern)
│   │   ├── routes/                # Express routers
│   │   ├── services/              # Бизнес-логика
│   │   │   └── answer.strategy.ts # Strategy pattern для верификации
│   │   ├── websocket/
│   │   │   └── ws.manager.ts      # Observer pattern (WebSocket rooms)
│   │   ├── seed.ts                # Тестовые данные
│   │   └── index.ts               # Точка входа
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ui/         # Layout, переиспользуемые компоненты
│   │   ├── context/               # AuthContext (React Context)
│   │   ├── hooks/
│   │   │   └── useQuestWebSocket.ts # WebSocket hook с автореконнектом
│   │   ├── pages/                 # Все страницы приложения
│   │   ├── services/api.ts        # HTTP-клиент
│   │   ├── types/index.ts         # TypeScript типы
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf                 # Reverse proxy + WS проксирование
├── docker-compose.yml
└── README.md
```

---

## Запуск локально (Docker Compose)

### Предварительные требования
- Docker Desktop 4.x+
- Docker Compose v2+

### 1. Клонировать репозиторий

```bash
git clone https://github.com/petrushinDO/quest_platform.git
cd quest_platform
```

### 2. Создать .env файлы

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Запустить все сервисы

```bash
docker compose up -d --build
```

### 4. Применить миграции и заполнить тестовыми данными

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed
```

### 5. Открыть в браузере

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000/api |
| Через NGINX | http://localhost:80 |

### Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Организатор | organizer@quest.ru | password123 |
| Игрок | player@quest.ru | password123 |

---

## Запуск без Docker (разработка)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # настрой DATABASE_URL на свой PostgreSQL
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### Auth
| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |

### Quests
| Метод | URL | Описание | Роль |
|-------|-----|----------|------|
| GET | /api/quests | Список опубликованных квестов | Public |
| GET | /api/quests/:id | Квест по ID | Public |
| GET | /api/quests/:id/leaderboard | Таблица лидеров | Public |
| GET | /api/quests/my/quests | Мои квесты | Organizer |
| POST | /api/quests | Создать квест | Organizer |
| PATCH | /api/quests/:id | Обновить квест | Organizer |
| POST | /api/quests/:id/publish | Опубликовать квест | Organizer |
| DELETE | /api/quests/:id | Удалить квест | Organizer |
| POST | /api/quests/:id/tasks | Добавить задание | Organizer |
| PATCH | /api/quests/:id/tasks/:taskId | Обновить задание | Organizer |
| DELETE | /api/quests/:id/tasks/:taskId | Удалить задание | Organizer |

### Sessions
| Метод | URL | Описание | Роль |
|-------|-----|----------|------|
| POST | /api/sessions | Начать прохождение | Player |
| GET | /api/sessions/:id | Состояние сессии | Player |
| POST | /api/sessions/:id/answer | Отправить ответ | Player |
| GET | /api/sessions/history | История прохождений | Player |

### Users
| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/users/me | Текущий пользователь |
| PATCH | /api/users/me | Обновить профиль |

### WebSocket

Подключение: `ws://host/ws?token=JWT&questId=ID&sessionId=ID`

**События от сервера:**

| Тип | Описание |
|-----|----------|
| `progress_updated` | Участник перешёл к следующему заданию |
| `session_completed` | Квест завершён |
| `task_answered` | Ответ проверен (только для текущего пользователя) |
| `player_joined` | Другой игрок присоединился к комнате |
| `player_left` | Игрок покинул комнату |

---

## Переменные окружения

### Backend (.env)

| Переменная | Описание | Пример |
|------------|----------|--------|
| DATABASE_URL | Строка подключения PostgreSQL | postgresql://user:pass@localhost:5432/db |
| JWT_SECRET | Секрет для подписи JWT | long_random_string |
| JWT_EXPIRES_IN | Срок жизни токена | 7d |
| PORT | Порт сервера | 4000 |
| NODE_ENV | Окружение | development |
| FRONTEND_URL | URL фронтенда для CORS | http://localhost:5173 |

---

## Архитектурные паттерны

- **Repository** — `src/repositories/` — изоляция логики доступа к БД
- **Strategy** — `src/services/answer.strategy.ts` — верификация ответов (TEXT / NUMBER / CHOICE)
- **Observer** — `src/websocket/ws.manager.ts` — WebSocket rooms для рассылки событий
- **MVC** — controllers / services / repositories
- **Dependency Injection** — через модули Express
- **RBAC** — `src/middleware/auth.middleware.ts` — `requireRole('ORGANIZER')`
