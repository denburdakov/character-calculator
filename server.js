require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Отключаем для разработки
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сессии
const SqliteStore = require('better-sqlite3-session-store')(session);
const Database = require('better-sqlite3');
const db = new Database('./database/sessions.db');

app.use(session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'Secret-SAO',
    resave: false,
    saveUninitialized: false,
    store: new SqliteStore({
        client: db,
        expired: { clear: true, intervalMs: 900000 }
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
        httpOnly: true,
        secure: false, // false для разработки
        sameSite: 'lax'
    }
}));

// Статические файлы
app.use('/static', express.static(path.join(__dirname, 'public/static')));
app.use('/data', express.static(path.join(__dirname, 'public/data')));

// Маршруты API
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// HTML страницы с проверкой авторизации
app.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'), {
        headers: { 'Cache-Control': 'no-store' }
    });
});

app.get('/login.html', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// API проверки доступности имени пользователя
app.get('/api/check_username', async (req, res) => {
    const { username } = req.query;
    // Временно возвращаем всегда true
    res.json({ available: true });
});

// API проверки email
app.get('/api/check_email', async (req, res) => {
    const { email } = req.query;
    // Временно возвращаем всегда true
    res.json({ available: true });
});

// Выход
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('[logout] Ошибка уничтожения сессии:', err);
            return res.status(500).send('Ошибка выхода');
        }

        // Сбрасываем cookie сессии в браузере
        res.clearCookie('sessionId', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false // true в продакшене по HTTPS
        });

        // Только теперь редиректим
        res.redirect('/login.html');
    });
});

// Fallback для всех остальных путей
app.get('/{*splat}', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'), {
        headers: { 'Cache-Control': 'no-store' }
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Статические файлы: ${path.join(__dirname, 'public')}`);
});