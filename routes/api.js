const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireApiAuth } = require('../middleware/auth');

// Сохранение данных калькулятора
router.post('/save', requireApiAuth, async (req, res) => {
    try {
        const saveData = req.body;
        const userId = req.session.userId;
        
        await db.saveUserData(userId, saveData);
        
        res.json({ 
            success: true, 
            message: 'Данные успешно сохранены',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
});

// Получение сохранений пользователя
router.get('/saves', requireApiAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const saves = await db.getUserSaves(userId);
        
        res.json({ 
            success: true, 
            saves: saves.map(save => ({
                ...save,
                save_data: JSON.parse(save.save_data)
            }))
        });
        
    } catch (error) {
        console.error('Ошибка получения сохранений:', error);
        res.status(500).json({ error: 'Ошибка получения сохранений' });
    }
});

// УДАЛИТЕ этот маршрут - он уже есть в auth.js
// router.get('/check_username', ...)

// API для работы с экипировкой
router.get('/equipment/:type', requireApiAuth, async (req, res) => {
    // Здесь можно добавить логику для работы с XML файлами экипировки
    const { type } = req.params;
    
    // Пример: чтение XML файлов из папки public/data
    res.json({ 
        success: true, 
        type, 
        message: 'API для экипировки работает'
    });
});

module.exports = router;