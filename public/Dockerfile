# syntax=docker/dockerfile:1

# ---------- Стадия 0: забираем исходники из репозитория ----------
FROM alpine/git:latest AS source
WORKDIR /src
RUN git clone --depth 1 --branch main \
        https://github.com/denburdakov/character-calculator.git .
# если ветка не main — поменяйте на master или свою

# ---------- Стадия 1: сборка нативных модулей ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --from=source /src/package.json /src/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Стадия 2: runtime ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=source /src/package.json /src/package-lock.json ./
COPY --from=source /src/server.js ./
COPY --from=source /src/routes ./routes
COPY --from=source /src/database ./database
COPY --from=source /src/public ./public

RUN mkdir -p /app/database \
    && groupadd -r app \
    && useradd -r -g app -d /app -s /sbin/nologin app \
    && chown -R app:app /app

USER app
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/login.html',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]