// equipment_remove_button.js
// Функции для добавления кнопок удаления экипировки

function addRemoveButtonsToEquipmentSlots() {
    document.querySelectorAll('.equipment-slot').forEach(slot => {
        // Проверяем, есть ли уже кнопка удаления
        if (slot.querySelector('.remove-equipment-btn')) return;

        const slotType = slot.getAttribute('data-slot');
        
        // Создаем кнопку удаления
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-equipment-btn';
        removeBtn.innerHTML = '✕';
        removeBtn.setAttribute('aria-label', 'Снять экипировку');
        removeBtn.setAttribute('data-slot', slotType);
        
        // Стили для кнопки
        removeBtn.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            border: 2px solid white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: var(--transition);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        // Добавляем обработчик наведения
        slot.addEventListener('mouseenter', () => {
            if (slot.classList.contains('equipped')) {
                removeBtn.style.display = 'flex';
            }
        });

        slot.addEventListener('mouseleave', () => {
            removeBtn.style.display = 'none';
        });

        // Обработчик клика по кнопке удаления
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем открытие модального окна
            
            const slotToRemove = removeBtn.getAttribute('data-slot');
            showRemoveConfirmation(slotToRemove);
        });

        slot.appendChild(removeBtn);
        slot.style.position = 'relative';
    });
}

function showRemoveConfirmation(slotType) {
    const slotName = getSlotName(slotType);
    const equipmentData = window.equipmentData?.[slotType];
    
    if (!equipmentData) return;

    // Создаем модальное окно подтверждения
    const confirmModal = document.createElement('div');
    confirmModal.className = 'remove-confirm-modal';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        backdrop-filter: blur(3px);
    `;

    const confirmContent = document.createElement('div');
    confirmContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: confirmAppear 0.3s ease-out;
    `;

    confirmContent.innerHTML = `
        <h3 style="color: var(--dark); margin-bottom: 15px;">Снять экипировку</h3>
        <p style="color: var(--gray); margin-bottom: 20px;">
            Вы уверены, что хотите снять <strong>${equipmentData.type}</strong> 
            со слота <strong>${slotName}</strong>?
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="confirm-remove-btn" style="
                padding: 10px 25px;
                background: var(--accent);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: var(--transition);
            ">Да, снять</button>
            <button class="cancel-remove-btn" style="
                padding: 10px 25px;
                background: var(--gray);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: var(--transition);
            ">Отмена</button>
        </div>
    `;

    confirmModal.appendChild(confirmContent);
    document.body.appendChild(confirmModal);

    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confirmAppear {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);

    // Обработчики
    confirmContent.querySelector('.confirm-remove-btn').addEventListener('click', () => {
        window.removeEquipmentFromSlot(slotType);
        document.body.removeChild(confirmModal);
    });

    confirmContent.querySelector('.cancel-remove-btn').addEventListener('click', () => {
        document.body.removeChild(confirmModal);
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            document.body.removeChild(confirmModal);
        }
    });
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем кнопки удаления
    setTimeout(() => {
        addRemoveButtonsToEquipmentSlots();
    }, 500); // Небольшая задержка для полной загрузки
    
    // Добавляем наблюдатель за изменениями в DOM для обновления кнопок
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Проверяем, были ли добавлены новые слоты или обновлены существующие
                addRemoveButtonsToEquipmentSlots();
            }
        });
    });

    observer.observe(document.querySelector('.equipment-slots-grid') || document.body, {
        childList: true,
        subtree: true
    });
});

// Экспортируем функции
window.addRemoveButtonsToEquipmentSlots = addRemoveButtonsToEquipmentSlots;
window.showRemoveConfirmation = showRemoveConfirmation;