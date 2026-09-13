# syntax=docker/dockerfile:1

# ============================================================
#  Стадия 1: сборка зависимостей (включая нативные модули:
#  better-sqlite3, sqlite3 — им нужны python/make/g++)
# ============================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
    && rm -rf /var/lib/apt/lists/*

# Копируем манифесты — пути считаются от build-контекста (корень проекта!)
COPY package.json package-lock.json ./

# Устанавливаем только production-зависимости
RUN npm ci --omit=dev && npm cache clean --force

# ============================================================
#  Стадия 2: runtime
# ============================================================
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

# Забираем уже собранные node_modules из builder
COPY --from=builder /app/node_modules ./node_modules

# Копируем исходники приложения (все пути — от корня character-calculator/)
COPY package.json package-lock.json ./
COPY server.js ./
COPY routes ./routes
COPY database ./database
COPY public ./public

# Каталог для SQLite-сессий + непривилегированный пользователь
RUN mkdir -p /app/database \
    && groupadd -r app \
    && useradd -r -g app -G app -d /app -s /sbin/nologin app \
    && chown -R app:app /app

USER app

EXPOSE 5000

# Проверка живости (сервер отдаёт /login.html даже без авторизации)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/login.html',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]