// equipment_main.js
// Главный файл для инициализации системы выбора экипировки

document.addEventListener('DOMContentLoaded', function() {
    // Создание модального окна и делаем его глобальным
    window.equipmentModal = document.createElement('div');
    window.equipmentModal.id = 'equipment-modal';

    window.modalContent = document.createElement('div');
    window.modalContent.id = 'modal-content';

    window.equipmentModal.appendChild(window.modalContent);
    document.body.appendChild(window.equipmentModal);

    // Переменные состояния
    window.currentSlot = '';
    window.currentSlotElement = null;
    window.selectedStats = [];
    window.selectedEquipmentType = '';
    window.selectedRuneLevel = 0;
    window.selectedStones = [];
    window.selectedQuality = '';
    window.selectedWeaponType = '';
    window.selectedLeftHandType = '';

    // Обработчики для слотов экипировки
    document.querySelectorAll('.equipment-slot').forEach(slot => {
        slot.addEventListener('click', function(event) {
            const targetSlot = event.currentTarget.getAttribute('data-slot');
            window.currentSlot = targetSlot;
            window.currentSlotElement = event.currentTarget;
            openEquipmentSelector(targetSlot, event.currentTarget);
        });
    });

    // Главная функция открытия выбора экипировки
    window.openEquipmentSelector = function(slotType, slotElement) {
        if (slotType === 'lhand') {
            openLeftHandTypeSelector(slotType);
            return;
        }

        window.currentSlot = slotType;
        window.currentSlotElement = slotElement;
        window.currentClass = getCurrentCharacterClass();
        
        const dataFile = EquipmentConfig.dataFiles[slotType];
        
        if (dataFile) {
            if (slotType === 'cape') {
                openQualitySelector(slotType, dataFile);
            } 
            else if (EquipmentConfig.jewelrySlots.includes(slotType)) {
                openJewelryQualitySelector(slotType, dataFile);
            }
            else if (slotType === 'rhand') {
                openWeaponTypeSelector(slotType, dataFile);
            } else {
                openEquipmentTypeSelector(slotType, dataFile);
            }
        } else {
            openBasicEquipmentSelector(slotType);
        }
    };

    function openBasicEquipmentSelector(slotType) {
        window.modalContent.innerHTML = `
            <h2 class="modal-title">Выбор экипировки</h2>
            <p class="modal-subtitle">Выберите тип экипировки:</p>
            <div class="equipment-types-grid">
                <div class="equipment-type-option" data-type="3-stat">
                    <h3>Эпическая</h3>
                    <p>3 характеристики</p>
                </div>
                <div class="equipment-type-option" data-type="4-stat">
                    <h3>Замковая</h3>
                    <p>4 характеристики</p>
                </div>
            </div>
            <div class="button-container">
                <button id="cancel-selection" class="modal-button button-cancel">Отмена</button>
                <button id="confirm-basic" class="modal-button button-confirm" disabled>Далее</button>
            </div>
        `;

        let selectedType = null;

        document.querySelectorAll('.equipment-type-option').forEach(option => {
            option.addEventListener('click', function() {
                if (selectedType) {
                    selectedType.classList.remove('selected');
                }

                this.classList.add('selected');
                selectedType = this;
                window.selectedEquipmentType = this.getAttribute('data-type');

                document.getElementById('confirm-basic').disabled = false;
            });
        });

        document.getElementById('confirm-basic').addEventListener('click', function() {
            if (selectedType) {
                // Заглушка для базового выбора
                closeModal();
            }
        });

        document.getElementById('cancel-selection').addEventListener('click', closeModal);
        window.equipmentModal.style.display = 'flex';
    }

    function updateLeftHandState() {
        const leftHandSlot = document.querySelector('.equipment-slot[data-slot="lhand"]');
        if (!leftHandSlot) return;

        const canUseShieldNow = canUseShield();
        const canDualWieldNow = canDualWield();
        const isAvailable = canUseShieldNow || canDualWieldNow;
        
        leftHandSlot.style.opacity = isAvailable ? '1' : '0.5';
        leftHandSlot.style.cursor = isAvailable ? 'pointer' : 'not-allowed';
        
        leftHandSlot.onclick = isAvailable ? function() {
            window.currentSlot = this.getAttribute('data-slot');
            window.currentSlotElement = this;
            window.openEquipmentSelector(window.currentSlot, this);
        } : null;
        
        return true;
    }

    function updateAllEquipmentSlots() {
        if (!window.equipmentData) return;
        
        Object.keys(window.equipmentData).forEach(slotType => {
            const equipmentData = window.equipmentData[slotType];
            if (equipmentData) {
                updateEquipmentSlotDisplay(slotType, equipmentData);
            }
        });
    }

    function resetSelectionState() {
        window.selectedStats = [];
        window.selectedEquipmentType = '';
        window.selectedRuneLevel = 0;
        window.selectedStones = [];
        window.selectedQuality = '';
        window.selectedWeaponType = '';
        window.selectedLeftHandType = '';
    }

    window.closeModal = function() {
        window.equipmentModal.style.display = 'none';
        resetSelectionState();
    };

    // Обработчик клика вне модального окна
    window.equipmentModal.addEventListener('click', function(event) {
        if (event.target === window.equipmentModal) {
            window.closeModal();
        }
    });

    // Экспорт функций в глобальную область
    window.updateLeftHandState = updateLeftHandState;
    window.updateAllEquipmentSlots = updateAllEquipmentSlots;
    window.resetSelectionState = resetSelectionState;
    
    // Обновление состояния левой руки при загрузке
    setTimeout(updateLeftHandState, 100);
});