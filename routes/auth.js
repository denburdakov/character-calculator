const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateRegistration, validateLogin } = require('../utils/validation');

// Регистрация
router.post('/register', async (req, res) => {
    try {
        console.log('Запрос на регистрацию:', req.body);
        
        const { username, password, email = '' } = req.body;
        
        // Валидация
        const validation = validateRegistration(username, password, email);
        if (!validation.valid) {
            return res.status(400).json({ 
                success: false,
                message: validation.message 
            });
        }
        
        // Проверка существования пользователя
        const existingUser = await db.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Имя пользователя уже занято' 
            });
        }
        
        // Создание пользователя
        const user = await db.createUser(username, password, email);
        console.log('Пользователь создан:', user);
        
        // Автоматический вход после регистрации
        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({ 
            success: true, 
            message: 'Регистрация успешна',
            user: { 
                id: user.id, 
                username: user.username,
                email: user.email 
            }
        });
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ 
            success: false,
            message: 'Внутренняя ошибка сервера' 
        });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        console.log('Запрос на вход:', req.body);
        
        const { username, password } = req.body;
        
        // Валидация
        const validation = validateLogin(username, password);
        if (!validation.valid) {
            return res.status(400).json({ 
                success: false,
                message: validation.message 
            });
        }
        
        // Проверка пользователя
        const user = await db.validateUser(username, password);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Неверное имя пользователя или пароль' 
            });
        }
        
        // Установка сессии
        req.session.userId = user.id;
        req.session.username = user.username;
        
        console.log('Успешный вход для пользователя:', user.username);
        
        res.json({ 
            success: true, 
            message: 'Вход выполнен успешно',
            user: { 
                id: user.id, 
                username: user.username 
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ 
            success: false,
            message: 'Внутренняя ошибка сервера' 
        });
    }
});

// Выход
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: 'Ошибка при выходе' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Выход выполнен успешно' 
        });
    });
});

// Проверка авторизации
router.get('/check', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            user: { 
                id: req.session.userId, 
                username: req.session.username 
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;