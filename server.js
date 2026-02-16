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
const SQLiteStore = require('connect-sqlite3')(session);
app.use(session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database'
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    req.session.destroy();
    res.redirect('/login.html');
});

// Fallback для всех остальных путей
app.get('*', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Статические файлы: ${path.join(__dirname, 'public')}`);
});