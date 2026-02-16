// Функционал меню
document.addEventListener('DOMContentLoaded', function() {
    // Элементы меню
    const menuButton = document.querySelector('.menu-button');
    const menuDropdown = document.querySelector('.menu-dropdown');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Открытие/закрытие меню
    menuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        menuDropdown.classList.toggle('active');
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function() {
        menuDropdown.classList.remove('active');
    });
    
    // Предотвращение закрытия меню при клике внутри него
    menuDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Обработчики для пунктов меню
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                openModal(modalId);
            }
            menuDropdown.classList.remove('active');
        });
    });
    
    // Функция открытия модального окна
    function openModal(modalName) {
        const modal = document.getElementById(`${modalName}-modal`);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Функция закрытия модального окна
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Закрытие модальных окон
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закрытие модальных окон при клике вне контента
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Закрытие модальных окон по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });
});