const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'users.db');

let db = null;

// Функция для получения базы данных с гарантированной инициализацией
async function getDB() {
    if (!db) {
        await initDatabase();
    }
    return db;
}

function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Ошибка подключения к БД:', err);
                reject(err);
                return;
            }
            
            console.log('✅ Подключено к SQLite базе данных');
            
            // Создаем таблицы
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Ошибка создания таблицы users:', err);
                    reject(err);
                } else {
                    console.log('✅ Таблица users создана/проверена');
                    
                    // Создаем таблицу для сохранений, если её еще нет
                    db.run(`
                        CREATE TABLE IF NOT EXISTS saves (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            save_data TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id)
                        )
                    `, (err) => {
                        if (err) {
                            console.error('❌ Ошибка создания таблицы saves:', err);
                            reject(err);
                        } else {
                            console.log('✅ Таблица saves создана/проверена');
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

async function createUser(username, password, email = '') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const database = await getDB();
    
    return new Promise((resolve, reject) => {
        database.run(
            `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
            [username, hashedPassword, email],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        username, 
                        email 
                    });
                }
            }
        );
    });
}

async function findUserByUsername(username) {
    const database = await getDB();
    
    return new Promise((resolve, reject) => {
        database.get(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

async function validateUser(username, password) {
    try {
        const user = await findUserByUsername(username);
        if (!user) return null;
        
        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    } catch (error) {
        console.error('Ошибка валидации пользователя:', error);
        return null;
    }
}

async function saveUserData(userId, saveData) {
    const database = await getDB();
    
    return new Promise((resolve, reject) => {
        database.run(
            `INSERT INTO saves (user_id, save_data) VALUES (?, ?)`,
            [userId, JSON.stringify(saveData)],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

async function getUserSaves(userId) {
    const database = await getDB();
    
    return new Promise((resolve, reject) => {
        database.all(
            `SELECT * FROM saves WHERE user_id = ? ORDER BY created_at DESC`,
            [userId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

function closeDatabase() {
    if (db) {
        db.close();
    }
}

// Экспортируем функции
module.exports = {
    initDatabase,
    createUser,
    findUserByUsername,
    validateUser,
    saveUserData,
    getUserSaves,
    closeDatabase,
    getDB: () => getDB()
};