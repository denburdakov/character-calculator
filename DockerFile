# ---------- Этап сборки (Builder) ----------
# Используем современный, но все еще поддерживаемый образ
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Копируем только манифесты для кэширования слоев
COPY package*.json ./

# Устанавливаем ВСЕ зависимости, включая devDependencies, необходимые для сборки
# Используем npm ci для воспроизводимости и игнорируем скрипты установки для безопасности
RUN npm ci --ignore-scripts

# Копируем исходный код
COPY . .

# Если у вас есть шаг сборки (например, для фронтенда), выполните его здесь
# RUN npm run build

# ---------- Этап Production (Runtime) ----------
# Используем тот же базовый образ, чтобы избежать несовместимости
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

# Устанавливаем только production-зависимости
# Это значительно уменьшает размер и поверхность атаки
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Копируем только необходимые артефакты из этапа сборки
# и остальной код приложения
COPY --from=builder /app/server.js .
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/database ./database
COPY --from=builder /app/public ./public
# ... скопируйте все необходимые директории и файлы

# Создаем папку для SQLite и даем права пользователю node
RUN mkdir -p /app/database && chown -R node:node /app

# Переключаемся на непривилегированного пользователя
USER node

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Используем exec-форму для корректной обработки сигналов
CMD ["node", "server.js"]