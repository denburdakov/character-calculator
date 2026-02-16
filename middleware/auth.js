// Middleware проверки авторизации
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        return res.redirect('/login');
    }
    next();
}

// Middleware для API
function requireApiAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    next();
}

module.exports = { requireAuth, requireApiAuth };