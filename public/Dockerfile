# syntax=docker/dockerfile:1

# ---------- Стадия 0: забираем исходники из репозитория ----------
FROM alpine/git:latest AS source
WORKDIR /src
RUN git clone --depth 1 --branch dev \
        https://github.com/denburdakov/character-calculator.git .

# ---------- Стадия 1: сборка нативных модулей ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --from=source /src/package.json /src/package-lock.json ./

# Собираем sqlite3/better-sqlite3 из исходников под GLIBC 2.36 Bookworm
ENV npm_config_build_from_source=true
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Стадия 2: runtime ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

# 1) Кладём ВЕСЬ код из git-клона (server.js, routes/, utils/, config/,
#    middleware/, public/, database/ и т.д. — всё, что есть в репо)
COPY --from=source /src/ ./

# 2) Поверх — уже собранные node_modules (перекроют любые, если вдруг были)
COPY --from=builder /app/node_modules ./node_modules

# Права и непривилегированный пользователь
RUN mkdir -p /app/database \
    && groupadd -r app \
    && useradd -r -g app -d /app -s /sbin/nologin app \
    && chown -R app:app /app

USER app
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/login.html',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]