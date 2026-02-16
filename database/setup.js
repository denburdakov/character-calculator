const db = require('./db');

async function setup() {
    try {
        await db.initDatabase();
        console.log('✅ База данных настроена успешно');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка настройки базы данных:', error);
        process.exit(1);
    }
}

setup();