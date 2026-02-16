const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

module.exports = {
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
};