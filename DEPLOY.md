# 🚀 Инструкция по деплою Quest Platform

## Вариант 1: Render.com (рекомендуется, бесплатно)

Render — самый простой вариант: бесплатный PostgreSQL, поддержка WebSocket, автодеплой с GitHub.

### Шаг 1. Пуш на GitHub

```bash
# Инициализируй git в папке проекта
cd quest_platform
git init
git add .
git commit -m "initial commit"

# Создай репозиторий на GitHub (github.com/new)
# Имя: quest_platform

git remote add origin https://github.com/<ТВОЙ_USERNAME>/quest_platform.git
git push -u origin main
```

### Шаг 2. Регистрация на Render

1. Открой https://render.com
2. Sign Up → через GitHub (самый быстрый)
3. Подтверди email

### Шаг 3. Создание PostgreSQL базы данных

1. Dashboard → **New** → **PostgreSQL**
2. Заполни:
   - **Name**: `quest-platform-db`
   - **Database**: `quest_platform`
   - **User**: `quest_user`
   - **Region**: Frankfurt (EU)
   - **Plan**: **Free**
3. Нажми **Create Database**
4. Подожди ~1 минуту, потом скопируй **Internal Database URL** (начинается с `postgresql://...`)

### Шаг 4. Деплой Backend

1. Dashboard → **New** → **Web Service**
2. Подключи свой GitHub репозиторий `quest_platform`
3. Заполни:
   - **Name**: `quest-platform-api`
   - **Region**: Frankfurt
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/index.js`
   - **Plan**: **Free**
4. Перейди в **Environment** → добавь переменные:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (вставь Internal Database URL из шага 3) |
| `JWT_SECRET` | (придумай длинную случайную строку, например: `aBcDeFgH123456789xYz`) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `FRONTEND_URL` | (пока оставь пустым, заполнишь после деплоя фронтенда) |

5. Нажми **Create Web Service**
6. Подожди ~3-5 минут пока соберётся
7. Когда станет зелёным — скопируй URL (например `https://quest-platform-api.onrender.com`)

### Шаг 5. Деплой Frontend

1. Dashboard → **New** → **Static Site**
2. Подключи тот же репозиторий
3. Заполни:
   - **Name**: `quest-platform-frontend`
   - **Branch**: main
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
4. **Environment** → добавь:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://quest-platform-api.onrender.com` (URL бэкенда из шага 4) |

5. Нажми **Create Static Site**
6. Подожди ~2-3 минуты

### Шаг 6. Добавь Rewrite Rule для SPA

1. Открой настройки frontend сервиса
2. **Redirects/Rewrites** → добавь:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**

### Шаг 7. Обнови CORS на бэкенде

1. Вернись в настройки backend сервиса
2. **Environment** → обнови `FRONTEND_URL`:
   - Значение: URL фронтенда (например `https://quest-platform-frontend.onrender.com`)
3. Render автоматически передеплоит

### Шаг 8. Заполни тестовыми данными

1. Открой backend сервис → **Shell** (вкладка вверху)
2. Или в терминале:
```bash
# Через Render Shell (в браузере):
node -e "
const { execSync } = require('child_process');
execSync('npx tsx src/seed.ts', { stdio: 'inherit', cwd: '/opt/render/project/src/backend' });
"
```

Либо можно зарегистрироваться через UI — seed не обязателен.

### Шаг 9. Готово! 🎉

Открой URL фронтенда в браузере. Если seed выполнен:
- Организатор: `organizer@quest.ru` / `password123`
- Игрок: `player@quest.ru` / `password123`

---

## Вариант 2: Railway.app

Railway проще, но нужна привязка карты (даже для бесплатного tier).

### Шаг 1. Пуш на GitHub (см. выше)

### Шаг 2. Регистрация

1. https://railway.app → Sign Up через GitHub
2. Привяжи карту для верификации

### Шаг 3. Новый проект

1. **New Project** → **Deploy from GitHub repo**
2. Выбери `quest_platform`
3. Railway автоматически определит структуру

### Шаг 4. Добавь PostgreSQL

1. **+ New** → **Database** → **PostgreSQL**
2. Railway создаст БД и автоматически добавит `DATABASE_URL`

### Шаг 5. Настрой Backend

1. Кликни на backend сервис
2. **Settings**:
   - Root Directory: `/backend`
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/index.js`
3. **Variables** → добавь:
   - `JWT_SECRET` = случайная строка
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
4. **Generate Domain** чтобы получить публичный URL

### Шаг 6. Настрой Frontend

1. Кликни на frontend сервис
2. **Settings**:
   - Root Directory: `/frontend`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npx serve dist -s`
3. **Variables** → `VITE_API_URL` = URL бэкенда
4. **Generate Domain**

### Шаг 7. CORS и seed

Как в Render — обнови `FRONTEND_URL` на бэкенде и запусти seed.

---

## Вариант 3: VPS (свой сервер)

Если есть VPS (DigitalOcean, Hetzner, Timeweb и т.д.)

```bash
# 1. Подключись к серверу
ssh user@your-server-ip

# 2. Установи Docker и Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Клонируй репозиторий
git clone https://github.com/<USERNAME>/quest_platform.git
cd quest_platform

# 4. Создай .env для продакшна
cat > .env << EOF
POSTGRES_DB=quest_platform
POSTGRES_USER=quest_user
POSTGRES_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=http://YOUR_SERVER_IP
VITE_API_URL=/api
EOF

# 5. Запусти всё
docker compose -f docker-compose.prod.yml up -d --build

# 6. Seed (опционально)
docker compose -f docker-compose.prod.yml exec backend npx tsx src/seed.ts

# 7. Проверь
curl http://YOUR_SERVER_IP/api/health
```

Приложение будет доступно по `http://YOUR_SERVER_IP`.

---

## Проверка деплоя (чеклист для защиты)

| Проверка | Как |
|----------|-----|
| ✅ Приложение открывается | Открой URL в браузере |
| ✅ Регистрация работает | Создай нового пользователя |
| ✅ Вход работает | Залогинься |
| ✅ Квесты отображаются | Главная страница показывает квесты |
| ✅ Карта работает | На странице квеста видны маркеры на карте |
| ✅ Прохождение работает | Начни квест, введи ответ, увидь прогресс |
| ✅ WebSocket работает | Открой квест в двух вкладках — при прохождении в одной, вторая получает обновления |
| ✅ Роли работают | Организатор может создавать квесты, игрок — нет |
| ✅ Dockerfile есть | В репозитории backend/Dockerfile и frontend/Dockerfile |
| ✅ docker-compose есть | docker-compose.yml и docker-compose.prod.yml |
| ✅ README есть | С описанием и инструкцией по запуску |
| ✅ Git репозиторий | Код на GitHub с историей коммитов |
