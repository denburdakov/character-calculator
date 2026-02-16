function validateRegistration(username, password, email) {
    // Проверка имени пользователя
    if (!username || username.length < 3) {
        return { valid: false, message: 'Имя пользователя должно содержать минимум 3 символа' };
    }
    
    // Проверка пароля
    if (!password || password.length < 6) {
        return { valid: false, message: 'Пароль должен содержать минимум 6 символов' };
    }
    
    // Проверка email (необязательно)
    if (email && !isValidEmail(email)) {
        return { valid: false, message: 'Некорректный email адрес' };
    }
    
    return { valid: true };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateLogin(username, password) {
    if (!username || !password) {
        return { valid: false, message: 'Заполните все поля' };
    }
    return { valid: true };
}

module.exports = {
    validateRegistration,
    validateLogin,
    isValidEmail
};