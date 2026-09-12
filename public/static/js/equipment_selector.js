// equipment_selector.js
document.addEventListener('DOMContentLoaded', function() {
    // Модальное окно для выбора экипировки
    const equipmentModal = document.createElement('div');
    equipmentModal.id = 'equipment-modal';

    // Контент модального окна
    const modalContent = document.createElement('div');
    modalContent.id = 'modal-content';

    equipmentModal.appendChild(modalContent);
    document.body.appendChild(equipmentModal);

    // Переменные состояния
    let currentSlot = '';
    let currentSlotElement = null;
    let selectedStats = [];
    let selectedEquipmentType = '';
    let selectedRuneLevel = 0;
    let selectedStones = [];
    let selectedQuality = '';
    let selectedWeaponType = '';
    let selectedLeftHandType = '';

    // Функция для получения текущего класса персонажа
    function getCurrentCharacterClass() {
        const activeClassButton = document.querySelector('.class-btn.active');
        if (activeClassButton) {
            return activeClassButton.getAttribute('data-class') || 'warrior';
        }
        
        return window.currentClass || 'warrior';
    }

    // Обработчики для слотов экипировки
    document.querySelectorAll('.equipment-slot').forEach(slot => {
        slot.addEventListener('click', function(event) {
            const targetSlot = event.currentTarget.getAttribute('data-slot');
            currentSlot = targetSlot;
            currentSlotElement = event.currentTarget;
            openEquipmentSelector(targetSlot, event.currentTarget);
        });
    });

    function getEquipmentIconPath(slotType, equipmentType, className) {
        const classFolders = {
            'warrior': 'Warrior',
            'rogue': 'Rogue', 
            'priest': 'Priest',
            'archer': 'Archer',
            'mage': 'Mage'
        };
        
        const slotIcons = {
            'chest': 'Chest',
            'helm': 'Helmet',
            'shoulders': 'Shoulders',
            'pants': 'Pants',
            'boots': 'Boots',
            'hands': 'Gloves',
            'belt': 'Belt',
            'bracers': 'Bracers',
            'cape': 'Cape'
        };
        
        const classFolder = classFolders[className] || 'Warrior';
        const slotIcon = slotIcons[slotType] || 'Chest';
        const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
        
        return `/static/Ico/Classes/${classFolder}/${setType}/${slotIcon}.svg`;
    }

    // Функция для получения пути к иконке оружия с рандомным выбором
    function getWeaponIconPath(weaponType, className, equipmentType) {
        const classFolders = {
            'warrior': 'Warrior',
            'rogue': 'Rogue',
            'priest': 'Priest', 
            'archer': 'Archer',
            'mage': 'Mage'
        };
        
        const classFolder = classFolders[className] || 'Warrior';
        
        const weaponFolder = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
        
        let weaponIcon = 'Weapon';
        
        if (className === 'rogue') {
            // Для разбойника: кинжал, меч, топор (только одноручное)
            const rogueWeapons = ['Dagger', '1HSword', '1HAxe'];
            weaponIcon = rogueWeapons[Math.floor(Math.random() * rogueWeapons.length)];
        } else if (className === 'mage') {
            // Для мага: 3 разных посоха (только двуручное)
            const mageWeapons = ['Staff_fire', 'Staff_ice', 'Staff_lightning'];
            weaponIcon = mageWeapons[Math.floor(Math.random() * mageWeapons.length)];
        } else if (className === 'warrior') {
            if (weaponType === 'two-handed') {
                // Для воина двуручное: двуручный меч или топор
                const warriorTwoHanded = ['2HSword', '2HAxe'];
                weaponIcon = warriorTwoHanded[Math.floor(Math.random() * warriorTwoHanded.length)];
            } else {
                // Для воина одноручное: меч, топор
                const warriorOneHanded = ['1HSword', '1HAxe'];
                weaponIcon = warriorOneHanded[Math.floor(Math.random() * warriorOneHanded.length)];
            }
        } else if (className === 'priest') {
            if (weaponType === 'two-handed') {
                // Для жреца двуручное: молот (только двуручное)
                const priestTwoHanded = ['2HMace'];
                weaponIcon = priestTwoHanded[Math.floor(Math.random() * priestTwoHanded.length)];
            } else {
                // Для жреца одноручное: молот
                const priestOneHanded = ['1HMace'];
                weaponIcon = priestOneHanded[Math.floor(Math.random() * priestOneHanded.length)];
            }
        } else if (className === 'archer') {
            // Для лучника: лук, арбалет (только двуручное)
            const archerWeapons = ['Bow', 'XBow'];
            weaponIcon = archerWeapons[Math.floor(Math.random() * archerWeapons.length)];
        }
        const iconPath = `/static/Ico/Classes/${classFolder}/${weaponFolder}/${weaponIcon}.svg`;
        return iconPath;
    }

    // Функция для получения пути к иконке щита
function getShieldIconPath(className, equipmentType) {
    const classFolders = {
        'warrior': 'Warrior',
        'priest': 'Priest'
    };
    
    const classFolder = classFolders[className] || 'Warrior';
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    return `/static/Ico/Classes/${classFolder}/${setType}/Shield.svg`;
}

    // Функция для получения пути к иконке бижутерии
    function getJewelryIconPath(slotType, quality, equipmentType) {
        const qualityFolder = quality === 'orange' ? 'orange' : 'purple';
        const slotIcons = {
            'neck': 'Neck',
            'ring1': 'Ring',
            'ring2': 'Ring',
            'trinket1': 'Trinket',
            'trinket2': 'Trinket'
        };
        
        const slotIcon = slotIcons[slotType] || 'Ring';
        
        const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
        
        return `/static/Ico/Classes/Jewelry/${qualityFolder}/${slotIcon}/${setType}/${slotIcon}.svg`;
    }

    // Функция для получения пути к иконке плаща
    function getCapeIconPath(quality, equipmentType) {
        const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
        if (quality === 'red') {
            return `/static/Ico/Classes/Cape/red/${setType}/Cape.svg`;
        } else {
            return `/static/Ico/Classes/Cape/orange/${setType}/Cape.svg`;
        }
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
    
    // Функция открытия выбора экипировки
    function openEquipmentSelector(slotType, slotElement) {
        // Проверка для левой руки - начинаем с выбора типа
        if (slotType === 'lhand') {
            openLeftHandTypeSelector(slotType);
            return;
        }

        // Проверка для щита
        if (slotType === 'lhand' && !checkShieldAvailability(slotType)) {
            return;
        }

        currentSlot = slotType;
        currentSlotElement = slotElement;
        
        // Сохраняем текущий класс в глобальной переменной для использования в выборе оружия
        window.currentClass = getCurrentCharacterClass();
        
        // Определяем XML файл с данными для этого слота
        const dataFiles = {
            'chest': 'Роба.xml',
            'helm': 'Голова.xml',
            'shoulders': 'Наплечники.xml',
            'pants': 'Штаны.xml',
            'boots': 'Сапоги.xml',
            'hands': 'Перчатки.xml',
            'belt': 'Пояс.xml',
            'bracers': 'Наручи.xml',
            'cape': 'Плащ.xml',
            'neck': 'Бижа.xml',
            'ring1': 'Бижа.xml',
            'ring2': 'Бижа.xml',
            'trinket1': 'Бижа.xml',
            'trinket2': 'Бижа.xml',
            'rhand': 'Оружие.xml',
            'rlhand': 'Оружие2.xml',
            'lhand': 'Оружие.xml',
            'shield': 'Щит.xml',
            'Shield': 'Щит.xml'
        };

        const dataFile = dataFiles[slotType];
        
        if (dataFile) {
            // Для плаща начинаем с выбора качества
            if (slotType === 'cape') {
                openQualitySelector(slotType, dataFile);
            } 
            // Для бижутерии начинаем с выбора качества
            else if (['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType)) {
                openJewelryQualitySelector(slotType, dataFile);
            }
            // Для оружия начинаем с выбора типа (одноручное/двуручное)
            else if (slotType === 'rhand') {
                openWeaponTypeSelector(slotType, dataFile);
            } else {
                // Для остальных слотов начинаем с выбора типа экипировки
                openEquipmentTypeSelector(slotType, dataFile);
            }
        } else {
            // Для слотов без специальных файлов используем базовый выбор
            openBasicEquipmentSelector(slotType);
        }
    }

    // Функция выбора качества для бижутерии
    function openJewelryQualitySelector(slotType, dataFile) {
        const slotNames = {
            'neck': 'Ожерелья',
            'ring1': 'Кольца',
            'ring2': 'Кольца', 
            'trinket1': 'Амулета',
            'trinket2': 'Амулета'
        };

        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор качества ${slotNames[slotType] || 'бижутерии'}</h2>
            <p class="modal-subtitle">Выберите качество бижутерии:</p>
            <div class="jewelry-quality-grid">
                <div class="jewelry-quality-option" data-quality="purple">
                    <h3>Фиолетовый</h3>
                    <p>Эпическое качество</p>
                    <div class="quality-color purple"></div>
                </div>
                <div class="jewelry-quality-option" data-quality="orange">
                    <h3>Оранжевый</h3>
                    <p>Легендарное качество</p>
                    <div class="quality-color orange"></div>
                </div>
            </div>
            <div class="button-container">
                <button id="cancel-selection" class="modal-button button-cancel">Отмена</button>
                <button id="confirm-jewelry-quality" class="modal-button button-confirm" disabled>Далее</button>
            </div>
        `;

        let selectedQualityOption = null;

        document.querySelectorAll('.jewelry-quality-option').forEach(option => {
            option.addEventListener('click', function() {
                if (selectedQualityOption) {
                    selectedQualityOption.classList.remove('selected');
                }

                this.classList.add('selected');
                selectedQualityOption = this;
                selectedQuality = this.getAttribute('data-quality');

                document.getElementById('confirm-jewelry-quality').disabled = false;
            });
        });

        document.getElementById('confirm-jewelry-quality').addEventListener('click', function() {
            if (selectedQualityOption) {
                openEquipmentTypeSelector(slotType, dataFile);
            }
        });

        document.getElementById('cancel-selection').addEventListener('click', closeModal);
        equipmentModal.style.display = 'flex';
    }

    // Функция выбора типа для левой руки (щит или второе оружие)
    function openLeftHandTypeSelector(slotType) {
        const currentClass = getCurrentCharacterClass();
        
        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор для левой руки</h2>
            <p class="modal-subtitle">Выберите тип экипировки для левой руки:</p>
            
            <div class="left-hand-type-grid">
                <div class="left-hand-type-option" data-type="shield">
                    <h3>🛡️ Щит</h3>
                    <p>Защита и блок</p>
                    <div class="compatibility-info">
                        ${getShieldCompatibilityInfo(currentClass)}
                    </div>
                </div>
                <div class="left-hand-type-option" data-type="weapon">
                    <h3>⚔️ Второе оружие</h3>
                    <p>Дополнительная атака</p>
                    <div class="compatibility-info">
                        ${getDualWieldCompatibilityInfo(currentClass)}
                    </div>
                </div>
            </div>
            
            <div class="button-container">
                <button id="cancel-selection" class="modal-button button-cancel">Отмена</button>
                <button id="confirm-left-hand-type" class="modal-button button-confirm" disabled>Далее</button>
            </div>
        `;

        let selectedTypeOption = null;

        document.querySelectorAll('.left-hand-type-option').forEach(option => {
            option.addEventListener('click', function() {
                if (selectedTypeOption) {
                    selectedTypeOption.classList.remove('selected');
                }

                this.classList.add('selected');
                selectedTypeOption = this;
                const selectedType = this.getAttribute('data-type');

                // Проверяем доступность выбранного типа
                if (selectedType === 'shield' && !canUseShield()) {
                    showShieldRestrictionMessage();
                    selectedTypeOption.classList.remove('selected');
                    selectedTypeOption = null;
                    document.getElementById('confirm-left-hand-type').disabled = true;
                    return;
                }

                if (selectedType === 'weapon' && !canDualWield()) {
                    showDualWieldRestrictionMessage();
                    selectedTypeOption.classList.remove('selected');
                    selectedTypeOption = null;
                    document.getElementById('confirm-left-hand-type').disabled = true;
                    return;
                }

                document.getElementById('confirm-left-hand-type').disabled = false;
                selectedLeftHandType = selectedType;
            });
        });

        document.getElementById('confirm-left-hand-type').addEventListener('click', function() {
            if (selectedTypeOption) {
                if (selectedLeftHandType === 'shield') {
                    // Открываем выбор щита
                    openShieldSelector(slotType);
                } else {
                    // Открываем выбор второго оружия
                    openSecondWeaponSelector(slotType);
                }
            }
        });

        document.getElementById('cancel-selection').addEventListener('click', closeModal);
        equipmentModal.style.display = 'flex';
    }

    // Функция открытия выбора щита
    function openShieldSelector(slotType) {
        const dataFile = 'Щит.xml';
        
        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор щита</h2>
            <p class="modal-subtitle">Выберите щит для левой руки:</p>
            
            <div class="button-container-center">
                <div class="equipment-type-option" data-type="3-stat">
                    <h3>Эпический щит</h3>
                    <p>3 характеристики</p>
                </div>
                <div class="equipment-type-option" data-type="4-stat">
                    <h3>Замковый щит</h3>
                    <p>4 характеристики</p>
                </div>
            </div>
            
            <div class="button-container">
                <button id="back-to-left-hand-type" class="modal-button button-back">← Назад</button>
                <button id="confirm-shield-type" class="modal-button button-confirm" disabled>Далее</button>
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
                selectedEquipmentType = this.getAttribute('data-type');

                document.getElementById('confirm-shield-type').disabled = false;
            });
        });

        document.getElementById('confirm-shield-type').addEventListener('click', function() {
            if (selectedType) {
                loadEquipmentDataFromXML(slotType, dataFile, selectedEquipmentType);
            }
        });

        document.getElementById('back-to-left-hand-type').addEventListener('click', function() {
            openLeftHandTypeSelector(slotType);
        });

        equipmentModal.style.display = 'flex';
    }

    // Функция открытия выбора второго оружия
    function openSecondWeaponSelector(slotType) {
        const dataFile = 'Оружие.xml';
        
        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор второго оружия</h2>
            <p class="modal-subtitle">Выберите одноручное оружие для левой руки:</p>
            
            <div class="button-container-center">
                <div class="equipment-type-option" data-type="3-stat">
                    <h3>Эпическое оружие</h3>
                    <p>3 характеристики</p>
                </div>
                <div class="equipment-type-option" data-type="4-stat">
                    <h3>Замковое оружие</h3>
                    <p>4 характеристики</p>
                </div>
            </div>
            
            <div class="button-container">
                <button id="back-to-left-hand-type" class="modal-button button-back">← Назад</button>
                <button id="confirm-weapon-type" class="modal-button button-confirm" disabled>Далее</button>
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
                selectedEquipmentType = this.getAttribute('data-type');

                document.getElementById('confirm-weapon-type').disabled = false;
            });
        });

        document.getElementById('confirm-weapon-type').addEventListener('click', function() {
            if (selectedType) {
                selectedWeaponType = 'one-handed';
                loadEquipmentDataFromXML(slotType, dataFile, selectedEquipmentType);
            }
        });

        document.getElementById('back-to-left-hand-type').addEventListener('click', function() {
            openLeftHandTypeSelector(slotType);
        });

        equipmentModal.style.display = 'flex';
    }

    // Функция получения информации о совместимости двух оружий
    function getDualWieldCompatibilityInfo(currentClass) {
        const classNames = {
            'warrior': 'Воин',
            'priest': 'Жрец', 
            'mage': 'Маг',
            'archer': 'Лучник',
            'rogue': 'Разбойник'
        };
        
        if (['rogue', 'warrior', 'priest'].includes(currentClass)) {
            return '<span style="color: var(--secondary);">✓ Доступно для ' + classNames[currentClass] + '</span>';
        } else {
            return '<span style="color: var(--accent);">✗ Недоступно для ' + classNames[currentClass] + '</span>';
        }
    }

    // Обновленная функция проверки состояния левой руки
    function updateLeftHandState() {
        const leftHandSlot = document.querySelector('.equipment-slot[data-slot="lhand"]');
        if (!leftHandSlot) return;

        const canUseShieldNow = canUseShield();
        const canDualWieldNow = canDualWield();
        const isAvailable = canUseShieldNow || canDualWieldNow;
        
        leftHandSlot.style.opacity = isAvailable ? '1' : '0.5';
        leftHandSlot.style.cursor = isAvailable ? 'pointer' : 'not-allowed';
        
        leftHandSlot.onclick = isAvailable ? function() {
            currentSlot = this.getAttribute('data-slot');
            currentSlotElement = this;
            openEquipmentSelector(currentSlot, this);
        } : null;
        
        return true;
    }

    // Добавляем функцию для принудительного обновления состояния при изменении класса
    function updateEquipmentStateOnClassChange() {
        updateLeftHandState();
        
        // Также обновляем состояние правой руки (оружия)
        const rightHandSlot = document.querySelector('.equipment-slot[data-slot="rhand"]');
        if (rightHandSlot && window.equipmentData?.rhand) {
            const currentWeaponType = window.equipmentData.rhand.weaponType;
            const currentClass = getCurrentCharacterClass();
            
            // Проверяем совместимость текущего оружия с новым классом
            const weaponTypesByClass = {
                'warrior': ['one-handed', 'two-handed'],
                'priest': ['one-handed', 'two-handed'],  
                'mage': ['two-handed'],
                'archer': ['two-handed'],
                'rogue': ['one-handed']
            };
            
            const availableTypes = weaponTypesByClass[currentClass] || ['one-handed', 'two-handed'];
            
            // Если текущий тип оружия не доступен для нового класса, снимаем его
            if (!availableTypes.includes(currentWeaponType)) {
                removeEquipmentFromSlot('rhand');
            }
        }
    }

    // Функция для снятия экипировки со слота
    function removeEquipmentFromSlot(slotType) {
        if (window.equipmentData?.[slotType]) {
            delete window.equipmentData[slotType];
            
            // Обновляем отображение слота
            const slotElement = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
            if (slotElement) {
                slotElement.innerHTML = `
                    <img src="/static/Ico/Button_Char/${getSlotIcon(slotType)}" alt="${slotType}">
                    <span>${getSlotName(slotType)}</span>
                `;
                slotElement.classList.remove('equipped');
            }
            
            // Удаляем статы из калькулятора
            if (window.statCalculator) {
                delete window.statCalculator.equipmentStats[slotType];
                window.statCalculator.updateStats();
            }
            
            console.log(`Экипировка с ${slotType} снята`);
        }
    }

    // Вспомогательные функции для получения имен и иконок слотов
    function getSlotIcon(slotType) {
        const icons = {
            'rhand': '07_Rhand.svg',
            'lhand': '11_Lhand.svg',
            'chest': '04_Chest.svg',
            'helm': '01_Helm.svg',
            'shoulders': '02_Shoulders.svg',
            'pants': '16_Pants.svg',
            'boots': '17_Boots.svg',
            'hands': '14_Hands.svg',
            'belt': '15_Belt.svg',
            'bracers': '13_Bracers.svg',
            'cape': '03_Cape.svg',
            'neck': '09_Neck.svg',
            'ring1': '08_Ring1.svg',
            'ring2': '12_Ring2.svg',
            'trinket1': '06_Trinket1.svg',
            'trinket2': '18_Trinket2.svg'
        };
        return icons[slotType] || '11_Lhand.svg';
    }

    function getSlotName(slotType) {
        const names = {
            'rhand': 'Правая рука',
            'lhand': 'Левая рука',
            'chest': 'Грудь',
            'helm': 'Голова',
            'shoulders': 'Плечи',
            'pants': 'Штаны',
            'boots': 'Обувь',
            'hands': 'Перчатки',
            'belt': 'Пояс',
            'bracers': 'Наручи',
            'cape': 'Плащ',
            'neck': 'Шея',
            'ring1': 'Кольцо 1',
            'ring2': 'Кольцо 2',
            'trinket1': 'Амулет 1',
            'trinket2': 'Амулет 2'
        };
        return names[slotType] || 'Слот';
    }

    // Функция показа сообщения о невозможности использования двух оружий
    function showDualWieldRestrictionMessage() {
        const currentClass = getCurrentCharacterClass();
        const classNames = {
            'warrior': 'Воин',
            'priest': 'Жрец', 
            'mage': 'Маг',
            'archer': 'Лучник',
            'rogue': 'Разбойник'
        };
        
        let message = '';
        
        // Проверяем наличие двуручного оружия
        const rightHandEquipment = window.equipmentData?.rhand;
        if (rightHandEquipment && rightHandEquipment.weaponType === 'two-handed') {
            message = 'Невозможно использовать два оружия с двуручным оружием. Сначала смените оружие на одноручное.';
        } 
        // Проверяем класс
        else if (!['rogue', 'warrior', 'priest'].includes(currentClass)) {
            message = `Класс "${classNames[currentClass]}" не может использовать два оружия. Только Разбойники, Воины и Жрецы могут использовать два оружия одновременно.`;
        }
        
        if (message) {
            alert(message);
            return false;
        }
        
        return true;
    }

    // Функция получения информации о совместимости щита
    function getShieldCompatibilityInfo(currentClass) {
        const classNames = {
            'warrior': 'Воин',
            'priest': 'Жрец', 
            'mage': 'Маг',
            'archer': 'Лучник',
            'rogue': 'Разбойник'
        };
        
        if (['warrior', 'priest'].includes(currentClass)) {
            return '<span style="color: var(--secondary);">✓ Доступно для ' + classNames[currentClass] + '</span>';
        } else {
            return '<span style="color: var(--accent);">✗ Недоступно для ' + classNames[currentClass] + '</span>';
        }
    }

    // Функция проверки возможности использования щита
    function canUseShield() {
        const currentClass = getCurrentCharacterClass();
        
        // Проверяем, есть ли двуручное оружие в правой руке
        const rightHandEquipment = window.equipmentData?.rhand;
        if (rightHandEquipment && rightHandEquipment.weaponType === 'two-handed') {
            return false; // Нельзя использовать щит с двуручным оружием
        }
        
        // Проверяем классы, которые могут использовать щит
        const shieldClasses = ['warrior', 'priest'];
        return shieldClasses.includes(currentClass);
    }

    // Функция проверки возможности использования двух оружий
    function canDualWield() {
        const currentClass = getCurrentCharacterClass();
        
        // Проверяем, есть ли двуручное оружие в правой руке
        const rightHandEquipment = window.equipmentData?.rhand;
        if (rightHandEquipment && rightHandEquipment.weaponType === 'two-handed') {
            return false; // Нельзя использовать два оружия с двуручным оружием
        }
        
        // Определяем классы, которые могут использовать два оружия
        const dualWieldClasses = ['rogue', 'warrior', 'priest'];
        return dualWieldClasses.includes(currentClass);
    }

    // Функция показа сообщения о невозможности использования щита
    function showShieldRestrictionMessage() {
        const currentClass = getCurrentCharacterClass();
        const classNames = {
            'warrior': 'Воин',
            'priest': 'Жрец', 
            'mage': 'Маг',
            'archer': 'Лучник',
            'rogue': 'Разбойник'
        };
        
        let message = '';
        
        // Проверяем класс
        if (!['warrior', 'priest'].includes(currentClass)) {
            message = `Класс "${classNames[currentClass]}" не может использовать щит. Только Воины и Жрецы могут использовать щиты.`;
        }
        
        if (message) {
            alert(message);
            return false;
        }
        
        return true;
    }


    // Выбор качества для плаща
    function openQualitySelector(slotType, dataFile) {
        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор качества плаща</h2>
            <p class="modal-subtitle">Выберите качество плаща:</p>
            <div class="quality-grid">
                <div class="quality-option" data-quality="orange">
                    <h3>Оранжевый</h3>
                    <p>Легендарное качество</p>
                    <div class="quality-color orange"></div>
                </div>
                <div class="quality-option" data-quality="red">
                    <h3>Красный</h3>
                    <p>Высшее качество</p>
                    <div class="quality-color red"></div>
                </div>
            </div>
            <div class="button-container">
                <button id="cancel-selection" class="modal-button button-cancel">Отмена</button>
                <button id="confirm-quality" class="modal-button button-confirm" disabled>Далее</button>
            </div>
        `;

        // Добавить стили для красного цвета
        const style = document.createElement('style');
        style.textContent = `
            .quality-color.red {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }
        `;
        document.head.appendChild(style);

        let selectedQualityOption = null;

        document.querySelectorAll('.quality-option').forEach(option => {
            option.addEventListener('click', function() {
                if (selectedQualityOption) {
                    selectedQualityOption.classList.remove('selected');
                }

                this.classList.add('selected');
                selectedQualityOption = this;
                selectedQuality = this.getAttribute('data-quality');

                document.getElementById('confirm-quality').disabled = false;
            });
        });

        document.getElementById('confirm-quality').addEventListener('click', function() {
            if (selectedQualityOption) {
                openEquipmentTypeSelector(slotType, dataFile);
            }
        });

        document.getElementById('cancel-selection').addEventListener('click', closeModal);
        equipmentModal.style.display = 'flex';
    }

    // Выбор типа оружия (одноручное/двуручное) с учетом класса
    function openWeaponTypeSelector(slotType, dataFile) {
        // Получаем текущий класс персонажа
        const currentClass = window.currentClass || 'warrior';
        
        // Определяем доступные типы оружия для каждого класса
        const weaponTypesByClass = {
            'warrior': ['one-handed', 'two-handed'],    // Воин: одноручное или двуручное
            'priest': ['one-handed', 'two-handed'],     // Жрец: одноручное или двуручное  
            'mage': ['two-handed'],                     // Маг: только двуручное
            'archer': ['two-handed'],                   // Лучник: только двуручное
            'rogue': ['one-handed']                     // Разбойник: только одноручное
        };
        
        const availableTypes = weaponTypesByClass[currentClass] || ['one-handed', 'two-handed'];
        
        // Создаем HTML для доступных типов оружия
        const weaponTypeOptions = availableTypes.map(type => {
            const typeInfo = {
                'one-handed': { name: 'Одноручное', desc: 'Можно использовать в паре с идентичным оружием, так и со щитом' },
                'two-handed': { name: 'Двуручное', desc: 'Большой урон, нельзя использовать со щитом' }
            }[type];
            
            return `
                <div class="weapon-type-option" data-weapon-type="${type}">
                    <h3>${typeInfo.name}</h3>
                    <p>${typeInfo.desc}</p>
                </div>
            `;
        }).join('');
        
        let restrictionMessage = '';
        if (availableTypes.length === 1) {
            const classNames = {
                'warrior': 'Воин',
                'priest': 'Жрец', 
                'mage': 'Маг',
                'archer': 'Лучник',
                'rogue': 'Разбойник'
            };
            restrictionMessage = `<p class="weapon-info">Класс "${classNames[currentClass]}" может использовать только ${availableTypes[0] === 'one-handed' ? 'одноручное' : 'двуручное'} оружие</p>`;
        }

        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор типа оружия</h2>
            ${restrictionMessage}
            <p class="modal-subtitle">Выберите тип оружия:</p>
            <div class="weapon-types-grid">
                ${weaponTypeOptions}
            </div>
            <div class="button-container">
                <button id="cancel-selection" class="modal-button button-cancel">Отмена</button>
                <button id="confirm-weapon-type" class="modal-button button-confirm" ${availableTypes.length === 1 ? '' : 'disabled'}>Далее</button>
            </div>
        `;

        let selectedWeaponTypeOption = null;

        // Для классов с одним вариантом автоматически выбираем его
        if (availableTypes.length === 1) {
            selectedWeaponType = availableTypes[0];
            // Автоматически переходим к следующему шагу через небольшую задержку
            setTimeout(() => {
                openEquipmentTypeSelector(slotType, getWeaponDataFile(selectedWeaponType));
            }, 100);
            return;
        }

        document.querySelectorAll('.weapon-type-option').forEach(option => {
            option.addEventListener('click', function() {
                if (selectedWeaponTypeOption) {
                    selectedWeaponTypeOption.classList.remove('selected');
                }

                this.classList.add('selected');
                selectedWeaponTypeOption = this;
                selectedWeaponType = this.getAttribute('data-weapon-type');

                document.getElementById('confirm-weapon-type').disabled = false;
            });
        });

        document.getElementById('confirm-weapon-type').addEventListener('click', function() {
            if (selectedWeaponTypeOption) {
                openEquipmentTypeSelector(slotType, getWeaponDataFile(selectedWeaponType));
            }
        });

        document.getElementById('cancel-selection').addEventListener('click', closeModal);
        equipmentModal.style.display = 'flex';
    }

    // Вспомогательная функция для определения файла данных оружия
    function getWeaponDataFile(weaponType) {
        return weaponType === 'two-handed' ? 'Оружие2.xml' : 'Оружие.xml';
    }

    // Выбор типа экипировки (3-статная или 4-статная)
    function openEquipmentTypeSelector(slotType, dataFile) {
        const slotNames = {
            'chest': 'Робы',
            'helm': 'Шлема',
            'shoulders': 'Наплечников',
            'pants': 'Штанов',
            'boots': 'Сапог',
            'hands': 'Перчаток',
            'bracers': 'Наручей',
            'belt': 'Пояса',
            'cape': 'Плаща',
            'neck': 'Ожерелья',
            'ring1': 'Кольца',
            'ring2': 'Кольца',
            'trinket1': 'Амулета',
            'trinket2': 'Амулета',
            'rhand': 'Оружия',
            'rlhand': 'Оружия',
            'lhand': 'Оружия',
            'Shield': 'Щит'
        };

        let qualityInfo = '';
        if (slotType === 'cape' && selectedQuality) {
            const qualityNames = {
                'orange': 'Оранжевый',
                'red': 'Красный'
            };
            qualityInfo = `<p class="quality-info">Качество: ${qualityNames[selectedQuality]}</p>`;
        }
        
        // Добавляем информацию о качестве для бижутерии
        if (['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType) && selectedQuality) {
            const qualityNames = {
                'purple': 'Фиолетовый',
                'orange': 'Оранжевый'
            };
            qualityInfo = `<p class="quality-info">Качество: ${qualityNames[selectedQuality]}</p>`;
        }

        let weaponInfo = '';
        if (slotType === 'rhand' && selectedWeaponType) {
            const weaponTypeNames = {
                'one-handed': 'Одноручное',
                'two-handed': 'Двуручное'
            };
            weaponInfo = `<p class="weapon-info">Тип: ${weaponTypeNames[selectedWeaponType]}</p>`;
        }

        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор ${slotNames[slotType] || 'экипировки'}</h2>
            ${qualityInfo}
            ${weaponInfo}
            <p class="modal-subtitle">Выберите тип экипировки:</p>
            <div class="button-container-center">
                <div class="equipment-type-option" data-type="3-stat">
                    <h3>Эпическая экипировка</h3>
                    <p>3 характеристики</p>
                </div>
                <div class="equipment-type-option" data-type="4-stat">
                    <h3>Замковая экипировка</h3>
                    <p>4 характеристики</p>
                </div>
            </div>
            <div class="button-container">
                <button id="cancel-selection" class="modal-button button-cancel">Отмена</button>
                ${slotType === 'cape' ? '<button id="back-to-quality" class="modal-button button-back">← Назад</button>' : ''}
                ${['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType) ? '<button id="back-to-jewelry-quality" class="modal-button button-back">← Назад</button>' : ''}
                ${slotType === 'rhand' ? '<button id="back-to-weapon-type" class="modal-button button-back">← Назад</button>' : ''}
                <button id="confirm-type" class="modal-button button-confirm" disabled>Далее</button>
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
                selectedEquipmentType = this.getAttribute('data-type');

                document.getElementById('confirm-type').disabled = false;
            });
        });

        document.getElementById('confirm-type').addEventListener('click', function() {
            if (selectedType) {
                loadEquipmentDataFromXML(slotType, dataFile, selectedEquipmentType);
            }
        });

        // Обработчики кнопок "Назад"
        if (slotType === 'cape') {
            document.getElementById('back-to-quality').addEventListener('click', function() {
                selectedEquipmentType = '';
                openQualitySelector(slotType, dataFile);
            });
        }

        if (['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType)) {
            document.getElementById('back-to-jewelry-quality').addEventListener('click', function() {
                selectedEquipmentType = '';
                openJewelryQualitySelector(slotType, dataFile);
            });
        }

        if (slotType === 'rhand') {
            document.getElementById('back-to-weapon-type').addEventListener('click', function() {
                openWeaponTypeSelector(slotType, dataFile);
            });
        }

        document.getElementById('cancel-selection').addEventListener('click', closeModal);
        equipmentModal.style.display = 'flex';
    }

    // Функция фильтрации экипировки по классу персонажа
    function filterEquipmentByClass(equipmentData, characterClass) {
        if (!equipmentData || !characterClass) {
            return equipmentData;
        }
        
        return equipmentData.filter(equip => {
            if (!equip.classes) {
                return true;
            }

            return equip.classes.includes(characterClass);
        });
    }

    // Функция для извлечения классов из XML
    function extractClassesFromXML(xmlDoc, equipmentType) {
        const equipmentData = [];
        const equipmentElements = xmlDoc.getElementsByTagName('equipment');
        
        for (let i = 0; i < equipmentElements.length; i++) {
            const equipElement = equipmentElements[i];
            const name = equipElement.getAttribute('name') || 'Без названия';
            const classes = equipElement.getAttribute('class') || '';
            
            const stats = [];
            const statElements = equipElement.getElementsByTagName('stat');
            const maxStats = equipmentType === '4-stat' ? 4 : 3;
            
            for (let j = 0; j < Math.min(maxStats, statElements.length); j++) {
                const statElement = statElements[j];
                const statName = statElement.getAttribute('name') || '';
                const statValue = statElement.textContent || '';
                
                if (statName && statValue) {
                    stats.push(`${statName} +${statValue}`);
                }
            }
            
            if (stats.length > 0) {
                equipmentData.push({
                    type: name,
                    stats: stats,
                    statKey: stats.join('|'),
                    classes: classes.split(',').map(c => c.trim()).filter(c => c) // Массив доступных классов
                });
            }
        }
        
        return equipmentData;
    }

    // Обновленная функция загрузки данных экипировки
    function loadEquipmentDataFromXML(slotType, dataFile, equipmentType) {
        // Определяем путь к файлу...
        let filePath = '';
        
        if (slotType === 'cape' && selectedQuality) {
            const statsFolder = equipmentType === '4-stat' ? '4-stats' : '3-stats';
            filePath = `/data/${selectedQuality}/${statsFolder}/${dataFile}`;
        } 
        else if (['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType) && selectedQuality) {
            const statsFolder = equipmentType === '4-stat' ? '4-stats' : '3-stats';
            filePath = `/data/jewelry/${selectedQuality}/${statsFolder}/${dataFile}`;
        }
        else {
            const statsFolder = equipmentType === '4-stat' ? '4-stats' : '3-stats';
            filePath = `/data/equipment/${statsFolder}/${dataFile}`;
        }

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Файл не найден: ${filePath}`);
                }
                return response.text();
            })
            .then(xmlText => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                
                if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                    throw new Error('Ошибка парсинга XML');
                }

                const equipmentData = extractClassesFromXML(xmlDoc, equipmentType);

                const currentClass = getCurrentCharacterClass();
                const filteredData = filterEquipmentByClass(equipmentData, currentClass);
                
                window.currentEquipmentData = filteredData;
                openEquipmentStatsSelector(slotType, filteredData, equipmentType);
            })
            .catch(error => {
                console.error('Ошибка загрузки данных экипировки:', error);
            });
    }

    // Функция преобразования статистик экипировки в формат для калькулятора
    function convertEquipmentStatsToCalculatorFormat(equipmentData, selectedIndex) {
        const selectedEquip = equipmentData[selectedIndex];
        const stats = {};
        
        selectedEquip.stats.forEach(statLine => {
            const match = statLine.match(/(.+?)\s*\+(\d+)/);
            if (match) {
                const statName = match[1].trim();
                const statValue = parseInt(match[2]);

                const statMapping = {
                    'Сила атаки': 'attack_power',
                    'Скорость атаки': 'attack_speed', 
                    'Точность': 'hit',
                    'Крит. Урон': 'crit',
                    'Парирование': 'parry',
                    'Уклонение': 'dodge',
                    'Сопр. Магии': 'resist',
                    'Блок': 'block',
                    'Маг. Броня': 'spell_armour',
                    'Броня': 'armour',
                    'Восст. Энергии': 'mp_reg',
                    'Восст. Здоровья': 'hp_reg',
                    'Энергия': 'mp',
                    'Здоровье': 'hp',
                    'Сопр.крит': 'crit_damage_resistance',
                    'Сопр. Крит. Урону': 'crit_damage_resistance'
                };
                
                const englishKey = statMapping[statName];
                if (englishKey) {
                    stats[englishKey] = statValue;
                } else {
                    console.warn('Неизвестная характеристика:', statName, 'в строке:', statLine);
                }
            } else {
                console.warn('Не удалось разобрать строку характеристики:', statLine);
            }
        });
        
        console.log('Итоговые статы для калькулятора:', stats);
        return stats;
    }

    // Функция открытия выбора характеристик для обычной экипировки
    function openEquipmentStatsSelector(slotType, equipmentData, equipmentType) {
        const slotNames = {
            'chest': 'Робы',
            'helm': 'Шлема',
            'shoulders': 'Наплечников',
            'pants': 'Штанов',
            'boots': 'Сапог',
            'hands': 'Перчаток',
            'bracers': 'Наручей',
            'belt': 'Пояса',
            'cape': 'Плаща',
            'neck': 'Ожерелья',
            'ring1': 'Кольца',
            'ring2': 'Кольца',
            'trinket1': 'Амулета',
            'trinket2': 'Амулета',
            'rhand': 'Оружия',
            'rlhand': 'Оружия',
            'lhand': 'Щита'
        };

        let qualityInfo = '';
        if (slotType === 'cape' && selectedQuality) {
            const qualityNames = {
                'orange': 'Оранжевый',
                'red': 'Красный'
            };
            qualityInfo = `<p class="quality-info">Качество: ${qualityNames[selectedQuality]}</p>`;
        }

        let weaponInfo = '';
        if (slotType === 'rhand' && selectedWeaponType) {
            const weaponTypeNames = {
                'one-handed': 'Одноручное',
                'two-handed': 'Двуручное'
            };
            weaponInfo = `<p class="weapon-info">Тип: ${weaponTypeNames[selectedWeaponType]}</p>`;
        }

        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор ${slotNames[slotType] || 'экипировки'} (${equipmentType === '4-stat' ? '4 стата' : '3 стата'})</h2>
            ${qualityInfo}
            ${weaponInfo}
            
            <!-- Поле поиска -->
            <div class="search-container" style="margin: 20px 0;">
                <input type="text" 
                    id="equipment-search" 
                    placeholder="Поиск по названию или характеристикам (например: Атаки, Сила атаки, Здоровье...)" 
                    style="width: 100%; 
                            padding: 12px 15px; 
                            border: 2px solid var(--border); 
                            border-radius: 10px; 
                            font-size: 1rem;
                            transition: var(--transition);
                            background: white;" />
                <div class="search-hint">Можно искать по названию экипировки или по характеристикам</div>
            </div>
            
            <p class="modal-subtitle">Выберите тип экипировки:</p>
            <div id="equipment-stats-grid">
                <!-- Характеристики будут загружены из XML -->
            </div>
            <div id="search-results-info" style="text-align: center; margin: 10px 0; color: var(--gray); font-size: 0.9rem;"></div>
            
            <div class="button-container">
                <button id="back-to-type" class="modal-button button-back">← Назад</button>
                <button id="confirm-equipment" class="modal-button button-confirm" disabled>Далее → Выбор рун</button>
            </div>
        `;

        // Сохраняем оригинальные данные для поиска
        window.currentEquipmentDataOriginal = [...equipmentData];
        
        // СНАЧАЛА загружаем опции в DOM
        loadEquipmentStatsOptions(equipmentData);
        
        // ПОТОМ настраиваем поиск
        setupSearchFunctionality();
        
        // И ТОЛЬКО ПОСЛЕ ЭТОГО настраиваем обработчики выбора
        setupEquipmentSelection(slotType, equipmentType);

        document.getElementById('back-to-type').addEventListener('click', function() {
            // Определяем XML файл с данными для этого слота
            const dataFiles = {
                'chest': 'Роба.xml',
                'helm': 'Голова.xml',
                'shoulders': 'Наплечники.xml',
                'pants': 'pants.xml',
                'boots': 'boots.xml',
                'hands': 'hands.xml',
                'belt': 'Пояс.xml',
                'bracers': 'bracers.xml',
                'cape': 'Плащ.xml',
                'neck': 'neck.xml',
                'ring1': 'Бижа.xml',
                'ring2': 'Бижа.xml',
                'trinket1': 'Бижа.xml',
                'trinket2': 'Бижа.xml',
                'rhand': 'Оружие.xml',
                'rlhand': 'Оружие2.xml',
                'lhand': 'Щит.xml'
            };
            
            const dataFile = dataFiles[slotType];
            
            // В зависимости от типа слота возвращаемся к соответствующему выбору
            if (slotType === 'cape') {
                openQualitySelector(slotType, dataFile);
            } else if (slotType === 'rhand') {
                openWeaponTypeSelector(slotType, dataFile);
            } else {
                openEquipmentTypeSelector(slotType, dataFile);
            }
        });

        equipmentModal.style.display = 'flex';
    }

    function setupEquipmentSelection(slotType, equipmentType) {
        let selectedOption = null;

        // Используем делегирование событий для динамически создаваемых элементов
        document.getElementById('equipment-stats-grid').addEventListener('click', function(event) {
            const statOption = event.target.closest('.stat-option');
            if (!statOption) return;

            if (selectedOption) {
                selectedOption.classList.remove('selected');
            }

            statOption.classList.add('selected');
            selectedOption = statOption;

            // ВАЖНОЕ ИСПРАВЛЕНИЕ: Получаем индекс из data-index, который должен соответствовать оригинальному массиву
            const selectedIndex = parseInt(statOption.getAttribute('data-index'));
            
            // Проверяем, что индекс корректен
            if (window.currentEquipmentData && window.currentEquipmentData[selectedIndex]) {
                selectedStats = [selectedIndex];
                document.getElementById('confirm-equipment').disabled = false;
            } else {
                console.error('Неверный индекс выбранного элемента:', selectedIndex);
                document.getElementById('confirm-equipment').disabled = true;
            }
        });

        // Добавляем обработчик для кнопки "Далее"
        document.getElementById('confirm-equipment').addEventListener('click', function() {
            if (selectedOption && window.currentEquipmentData && selectedStats.length > 0) {
                const selectedIndex = selectedStats[0];
                if (window.currentEquipmentData[selectedIndex]) {
                    openRuneSelector(slotType, equipmentType);
                } else {
                    console.error('Выбран неверный индекс экипировки:', selectedIndex);
                    alert('Ошибка выбора экипировки. Пожалуйста, выберите снова.');
                }
            } else {
                console.error('Не выбрана экипировка');
                alert('Пожалуйста, выберите тип экипировки');
            }
        });
    }

    // Функция загрузки опций характеристик из XML данных
    function loadEquipmentStatsOptions(equipmentData) {
        const statsGrid = document.getElementById('equipment-stats-grid');
        
        if (!statsGrid) return;
        
        statsGrid.innerHTML = '';

        if (equipmentData.length === 0) {
            const currentClass = getCurrentCharacterClass();
            const classNames = {
                'warrior': 'Воин',
                'priest': 'Жрец', 
                'mage': 'Маг',
                'archer': 'Лучник',
                'rogue': 'Разбойник'
            };
            
            statsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; 
                        text-align: center; 
                        padding: 40px 20px; 
                        color: var(--gray);
                        background: var(--lighter);
                        border-radius: 12px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🎯</div>
                    <h4 style="margin-bottom: 10px; color: var(--dark);">Нет доступной экипировки</h4>
                    <p>Для класса <strong>${classNames[currentClass]}</strong> нет подходящей экипировки</p>
                    <p style="font-size: 0.9rem; margin-top: 10px; color: var(--gray);">
                        Попробуйте изменить поисковый запрос или выберите другой класс
                    </p>
                </div>
            `;
            return;
        }

        equipmentData.forEach((equipType, index) => {
            const statOption = document.createElement('div');
            statOption.className = 'stat-option';
            statOption.setAttribute('data-index', index);

            // Подсветка найденных характеристик
            const highlightedStats = equipType.stats.map(stat => {
                // Подсвечиваем характеристики, которые содержат поисковый запрос
                const searchTerm = document.getElementById('equipment-search')?.value.trim().toLowerCase();
                if (searchTerm && stat.toLowerCase().includes(searchTerm)) {
                    return `<div style="background: var(--warning-light); padding: 2px 4px; border-radius: 4px; margin: 2px 0;">${stat}</div>`;
                }
                return `<div>${stat}</div>`;
            }).join('');

            statOption.innerHTML = `
                <h4>${equipType.type}</h4>
                <div class="stats-list">
                    ${highlightedStats}
                </div>
            `;

            statsGrid.appendChild(statOption);
        });
    }

    // Функция настройки поиска
    function setupSearchFunctionality() {
        const searchInput = document.getElementById('equipment-search');
        const resultsInfo = document.getElementById('search-results-info');
        
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            filterEquipmentOptions(searchTerm);
        });
    }

    // Функция фильтрации опций экипировки
    function filterEquipmentOptions(searchTerm) {
        const resultsInfo = document.getElementById('search-results-info');
        const currentClass = getCurrentCharacterClass();
        
        if (!searchTerm) {
            // Показываем все опции, отфильтрованные по классу
            const filteredByClass = filterEquipmentByClass(window.currentEquipmentDataOriginal, currentClass);
            loadEquipmentStatsOptions(filteredByClass);
            window.currentEquipmentData = filteredByClass;
            
            if (resultsInfo) {
                const totalForClass = filteredByClass.length;
                const totalAll = window.currentEquipmentDataOriginal.length;
                const hiddenCount = totalAll - totalForClass;
                
                let infoText = `Найдено: ${totalForClass} вариантов`;
                if (hiddenCount > 0) {
                    infoText += ` (скрыто ${hiddenCount} для вашего класса)`;
                }
                resultsInfo.textContent = infoText;
            }
            return;
        }
        
        // ФИЛЬТРАЦИЯ ПО НАЗВАНИЮ И ХАРАКТЕРИСТИКАМ
        const filteredBySearch = window.currentEquipmentDataOriginal.filter(equip => {
            // Поиск по названию экипировки
            const nameMatch = equip.type.toLowerCase().includes(searchTerm);
            
            // Поиск по характеристикам
            const statsMatch = equip.stats.some(stat => 
                stat.toLowerCase().includes(searchTerm)
            );
            
            return nameMatch || statsMatch;
        });
        
        const filteredData = filterEquipmentByClass(filteredBySearch, currentClass);
        window.currentEquipmentData = filteredData;
        
        loadEquipmentStatsOptions(filteredData);
        
        if (resultsInfo) {
            if (filteredData.length === 0) {
                resultsInfo.textContent = `Ничего не найдено по запросу "${searchTerm}" для вашего класса`;
                resultsInfo.style.color = 'var(--accent)';
            } else {
                const totalForClass = filteredData.length;
                const totalSearch = filteredBySearch.length;
                const hiddenCount = totalSearch - totalForClass;
                
                let infoText = `Найдено: ${totalForClass} из ${totalSearch} вариантов`;
                if (hiddenCount > 0) {
                    infoText += ` (скрыто ${hiddenCount} для вашего класса)`;
                }
                resultsInfo.textContent = infoText;
                resultsInfo.style.color = 'var(--secondary)';
            }
        }
        
        document.getElementById('confirm-equipment').disabled = true;
        selectedStats = [];
    }

    // Выбор уровня рун улучшения
    function openRuneSelector(slotType, equipmentType) {
        let qualityInfo = '';
        if (slotType === 'cape' && selectedQuality) {
            const qualityNames = {
                'orange': 'Оранжевый',
                'red': 'Красный'
            };
            qualityInfo = `<p class="quality-info">Качество: ${qualityNames[selectedQuality]}</p>`;
        }

        let weaponInfo = '';
        if (slotType === 'rhand' && selectedWeaponType) {
            const weaponTypeNames = {
                'one-handed': 'Одноручное',
                'two-handed': 'Двуручное'
            };
            weaponInfo = `<p class="weapon-info">Тип: ${weaponTypeNames[selectedWeaponType]}</p>`;
        }

        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор уровня рун улучшения</h2>
            ${qualityInfo}
            ${weaponInfo}
            <p class="modal-subtitle">Выберите уровень улучшения рунами (от 1 до 12):</p>
            <div class="runes-grid">
                ${Array.from({length: 12}, (_, i) => i + 1).map(level => `
                    <div class="rune-level-option" data-level="${level}">
                        <h3>+${level}</h3>
                        <p>Уровень ${level}</p>
                    </div>
                `).join('')}
            </div>
            <div class="button-container">
                <button id="back-to-stats" class="modal-button button-back">← Назад</button>            
                <button id="skip-runes" class="modal-button button-skip">Без рун</button>
                <button id="confirm-runes" class="modal-button button-confirm" disabled>Далее → Выбор камней</button>
            </div>
        `;

        let selectedRuneOption = null;

        document.querySelectorAll('.rune-level-option').forEach(option => {
            option.addEventListener('click', function() {
                if (selectedRuneOption) {
                    selectedRuneOption.classList.remove('selected');
                }

                this.classList.add('selected');
                selectedRuneOption = this;
                selectedRuneLevel = parseInt(this.getAttribute('data-level'));

                document.getElementById('confirm-runes').disabled = false;
            });
        });

        // Обработчик кнопки "Без рун"
        document.getElementById('skip-runes').addEventListener('click', function() {
            selectedRuneLevel = 0;
            openStoneSelector(slotType, equipmentType);
        });

        document.getElementById('back-to-stats').addEventListener('click', function() {
            openEquipmentStatsSelector(slotType, window.currentEquipmentData, equipmentType);
        });

        document.getElementById('confirm-runes').addEventListener('click', function() {
            if (selectedRuneOption) {
                openStoneSelector(slotType, equipmentType);
            }
        });

        equipmentModal.style.display = 'flex';
    }

    // Выбор камней
    function openStoneSelector(slotType, equipmentType) {
        // Проверяем, является ли слот оружием или щитом
        const weaponSlots = ['rhand', 'lhand', 'rlhand'];
        const isWeaponOrShield = weaponSlots.includes(slotType) || 
                                (slotType === 'lhand' && selectedLeftHandType === 'weapon') ||
                                (slotType === 'lhand' && selectedLeftHandType === 'shield');
        
        // Правильно определяем тип оружия и щита
        let isTwoHandedWeapon = false;
        let isOneHandedWeapon = false;
        let isShield = false;
        
        if (slotType === 'rhand') {
            isTwoHandedWeapon = selectedWeaponType === 'two-handed';
            isOneHandedWeapon = selectedWeaponType === 'one-handed';
        } else if (slotType === 'lhand' && selectedLeftHandType === 'weapon') {
            isOneHandedWeapon = true;
        } else if (slotType === 'lhand' && selectedLeftHandType === 'shield') {
            isShield = true;
        }
        
        const isWeapon = isTwoHandedWeapon || isOneHandedWeapon || isShield;
        
        // Проверяем, является ли слот бижутерией или плащом
        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        const skipStonesSlots = [...jewelrySlots, 'cape'];
        
        if (skipStonesSlots.includes(slotType)) {
            // Пропускаем выбор камней и сразу применяем экипировку
            applyEquipmentSelection(slotType, equipmentType);
            closeModal();
            return;
        }

        // ИСПРАВЛЕНИЕ: Получаем stoneBonuses из StoneCalculator
        const stoneBonuses = window.statCalculator?.stoneCalculator?.getStoneBonuses?.() || {};
        
        const regularStones = [
            { id: 'hp', name: 'Здоровье', color: '#ff6b6b' },
            { id: 'mp', name: 'Энергия', color: '#4ecdc4' },
            { id: 'attack_power', name: 'Сила атаки', color: '#45b7d1' },
            { id: 'attack_speed', name: 'Скорость атаки', color: '#96ceb4' },
            { id: 'hit', name: 'Точность', color: '#feca57' },
            { id: 'dodge', name: 'Уклонение', color: '#ff9ff3' },
            { id: 'parry', name: 'Парирование', color: '#54a0ff' },
            { id: 'resist', name: 'Сопр. магии', color: '#5f27cd' },
            { id: 'crit', name: 'Шанс крит. урона', color: '#00d2d3' },
            { id: 'armour', name: 'Физ. броня', color: '#ff9f43' },
            { id: 'spell_armour', name: 'Маг. Броня', color: '#ee5253' },
            { id: 'block', name: 'Блок', color: '#a29bfe' },
            { id: 'hp_reg', name: 'Восст. Здоровья', color: '#fd79a8' },
            { id: 'mp_reg', name: 'Восст. Энергии', color: '#81ecec' },
            { id: 'crit_damage_resistance', name: 'Сопр. Крит', color: '#049c76ff' }
        ];

        const weaponStones = [
            { id: 'hp_percent', name: 'Здоровье %', color: '#ff6b6b' },
            { id: 'mp_percent', name: 'Энергия %', color: '#4ecdc4' },
            { id: 'attack_power_percent', name: 'Сила атаки %', color: '#45b7d1' },
            { id: 'attack_speed_percent', name: 'Скорость атаки %', color: '#96ceb4' },
            { id: 'hit_percent', name: 'Точность %', color: '#feca57' },
            { id: 'dodge_percent', name: 'Уклонение %', color: '#ff9ff3' },
            { id: 'parry_percent', name: 'Парирование %', color: '#54a0ff' },
            { id: 'resist_percent', name: 'Сопр. магии %', color: '#5f27cd' },
            { id: 'crit_percent', name: 'Шанс крит. урона %', color: '#00d2d3' },
            { id: 'armour_percent', name: 'Физ. броня %', color: '#ff9f43' },
            { id: 'spell_armour_percent', name: 'Маг. Броня %', color: '#ee5253' },
            { id: 'block_percent', name: 'Блок %', color: '#a29bfe' },
            { id: 'hp_reg_percent', name: 'Восст. Здоровья %', color: '#fd79a8' },
            { id: 'mp_reg_percent', name: 'Восст. Энергии %', color: '#81ecec' },
            { id: 'crit_damage_resistance_percent', name: 'Сопр. Крит %', color: '#049c76ff' }
        ];

        // Для оружия и щита - только процентные камни, для обычной экипировки - обычные камни
        const stones = isWeaponOrShield ? weaponStones : regularStones;
        const stoneLevels = [1, 2, 3, 4, 5]; // Всегда показываем уровни 1-5

        let qualityInfo = '';
        if (slotType === 'cape' && selectedQuality) {
            const qualityNames = {
                'orange': 'Оранжевый',
                'red': 'Красный'
            };
            qualityInfo = `<p class="quality-info">Качество: ${qualityNames[selectedQuality]}</p>`;
        }

        let weaponInfo = '';
        if (slotType === 'rhand' && selectedWeaponType) {
            const weaponTypeNames = {
                'one-handed': 'Одноручное',
                'two-handed': 'Двуручное'
            };
            weaponInfo = `<p class="weapon-info">Тип: ${weaponTypeNames[selectedWeaponType]}</p>`;
        }

        // Разный HTML в зависимости от типа экипировки
        const levelSelectorHTML = `
            <div class="stone-level-selector">
                <h4>Уровень камня:</h4>
                <div class="stone-levels">
                    ${stoneLevels.map(level => `
                        <div class="stone-level-option" data-level="${level}">
                            <span>Ур. ${level}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        modalContent.innerHTML = `
            <h2 class="modal-title">Выбор камней</h2>
            ${qualityInfo}
            ${weaponInfo}
            <p class="modal-subtitle" id="stone-subtitle">${getStoneSubtitle(slotType, isWeaponOrShield, isTwoHandedWeapon)}</p>
            
            ${levelSelectorHTML}

            <div class="stones-grid">
                ${stones.map(stone => `
                    <div class="stone-option" data-stone="${stone.id}" style="background: ${stone.color}20; border: 2px solid ${stone.color}40;">
                        <h3 style="color: ${stone.color};">${stone.name}</h3>
                        <p class="stone-values" id="stone-${stone.id}-values" style="font-size: 0.9rem; margin: 5px 0;">
                            ${getStoneValueDisplay(stone.id, 1, isWeaponOrShield, stoneBonuses)}
                        </p>
                        <div class="stone-counter" id="stone-${stone.id}-counter">0</div>
                    </div>
                `).join('')}
            </div>

            <div id="selected-stones">
                <h4>Выбранные камни: <span id="stone-counter">0/${getMaxStones(slotType, isTwoHandedWeapon)}</span></h4>
                <div id="stones-list">Не выбрано</div>
                <button id="reset-stones" class="modal-button button-reset">Сбросить камни</button>
            </div>

            <div class="button-container">
                <button id="back-to-runes" class="modal-button button-back">← Назад</button>            
                <button id="skip-stones" class="modal-button button-skip">Без камней</button>
                <button id="confirm-stones" class="modal-button button-confirm">Применить экипировку</button>
            </div>
        `;

        // Инициализация значений камней
        updateStoneValues(1, isWeaponOrShield, stoneBonuses);
        
        selectedStones = [];
        let currentStoneLevel = 1; // Начинаем с уровня 1

        // Обработчик выбора уровня камня
        document.querySelectorAll('.stone-level-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.stone-level-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                currentStoneLevel = parseInt(this.getAttribute('data-level'));
                updateStoneValues(currentStoneLevel, isWeaponOrShield, stoneBonuses);
            });
        });

        // Выбираем первый уровень по умолчанию
        document.querySelector('.stone-level-option[data-level="1"]')?.classList.add('selected');

        // Обработчик выбора камня
        document.querySelectorAll('.stone-option').forEach(option => {
            option.addEventListener('click', function() {
                const stoneId = this.getAttribute('data-stone');
                const stone = stones.find(s => s.id === stoneId);
                const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
                
                // Проверяем лимит камней
                if (selectedStones.length >= maxStones) {
                    alert(`Можно выбрать не более ${maxStones} камней`);
                    return;
                }
                
                // Проверяем ограничения на одинаковые камни
                if (isWeaponOrShield) {
                    // Для оружия - можно максимум 2 одинаковых камня
                    const sameStoneCount = selectedStones.filter(s => s.id === stoneId).length;
                    if (sameStoneCount >= 2) {
                        alert('Можно установить максимум 2 одинаковых камня в оружие');
                        return;
                    }
                } else {
                    // Для обычной экипировки - нельзя одинаковые камни
                    const sameStoneExists = selectedStones.some(s => s.id === stoneId);
                    if (sameStoneExists) {
                        alert('Нельзя устанавливать одинаковые камни в обычную экипировку');
                        return;
                    }
                }
                
                // Добавляем один камень с текущим уровнем
                selectedStones.push({
                    id: stoneId,
                    level: currentStoneLevel,
                    name: stone.name,
                    isPercentage: isWeaponOrShield
                });
                
                // Обновляем счетчик на кнопке камня
                const counterElement = document.getElementById(`stone-${stoneId}-counter`);
                const currentCount = parseInt(counterElement.textContent) || 0;
                counterElement.textContent = currentCount + 1;
                
                // Визуальное выделение
                this.style.borderColor = stone.color;
                this.style.backgroundColor = `${stone.color}40`;
                this.classList.add('selected');

                updateSelectedStonesDisplay();
            });
        });

        // Обработчик кнопки "Сбросить камни"
        document.getElementById('reset-stones').addEventListener('click', function() {
            // Сбрасываем все камни
            selectedStones = [];
            
            // Сбрасываем счетчики на кнопках камней
            stones.forEach(stone => {
                const counterElement = document.getElementById(`stone-${stone.id}-counter`);
                counterElement.textContent = '0';
                
                const stoneOption = document.querySelector(`.stone-option[data-stone="${stone.id}"]`);
                stoneOption.style.borderColor = `${stone.color}40`;
                stoneOption.style.backgroundColor = `${stone.color}20`;
                stoneOption.classList.remove('selected');
            });
            
            updateSelectedStonesDisplay();
        });

        // Кнопка "Без камней"
        document.getElementById('skip-stones').addEventListener('click', function() {
            selectedStones = [];
            applyEquipmentSelection(slotType, equipmentType);
            closeModal();
        });

        document.getElementById('back-to-runes').addEventListener('click', function() {
            openRuneSelector(slotType, equipmentType);
        });

        document.getElementById('confirm-stones').addEventListener('click', function() {
            if (window.currentEquipmentData && selectedStats.length > 0) {
                applyEquipmentSelection(slotType, equipmentType);
                closeModal();
            } else {
                console.error('Не выбрана экипировка или отсутствуют данные');
                alert('Пожалуйста, выберите тип экипировки');
            }
        });

        equipmentModal.style.display = 'flex';
    }

    // Новая функция для отображения значения камня
    function getStoneValueDisplay(stoneId, level, isWeapon, stoneBonuses) {
        // Используем прямой доступ к данным камней
        const stoneData = stoneBonuses[stoneId];
        if (!stoneData || !stoneData.values) {
            return isWeapon ? '+0%' : '+0 ед.';
        }
        
        const value = stoneData.values[level - 1];
        return isWeapon ? `+${value}%` : `+${value} ед.`;
    }


    // Вспомогательные функции для определения лимита камней:
    function getMaxStones(slotType, isTwoHandedWeapon = false) {
        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        const skipStonesSlots = [...jewelrySlots, 'cape'];
        
        if (skipStonesSlots.includes(slotType)) {
            return 0; // Никаких камней для бижутерии и плаща
        }
        
        // Правильно определяем количество камней для оружия и щита
        if (slotType === 'rhand') {
            return isTwoHandedWeapon ? 6 : 3; // 6 камней в двуручное, 3 в одноручное
        } else if (slotType === 'lhand' && selectedLeftHandType === 'weapon') {
            return 3; // 3 камня во второе оружие
        } else if (slotType === 'lhand' && selectedLeftHandType === 'shield') {
            return 3; // 3 камня в щит
        } else {
            return 2; // 2 камня в обычную экипировку
        }
    }

    function getStoneSubtitle(slotType, isWeapon = false, isTwoHandedWeapon = false) {
        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        const skipStonesSlots = [...jewelrySlots, 'cape'];
        
        if (skipStonesSlots.includes(slotType)) {
            return 'Камни не доступны для этого типа экипировки';
        }
        
        const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
        
        if (isWeapon) {
            if (maxStones === 6) {
                return 'Выберите уровень и тип камня для установки в двуручное оружие (максимум 6 камней, можно до 2 одинаковых, уровень влияет на % бонуса):';
            } else if (maxStones === 3) {
                if (slotType === 'lhand' && selectedLeftHandType === 'shield') {
                    return 'Выберите уровень и тип камня для установки в щит (максимум 3 камня, можно до 2 одинаковых, уровень влияет на % бонуса):';
                } else {
                    return 'Выберите уровень и тип камня для установки в оружие (максимум 3 камня, можно до 2 одинаковых, уровень влияет на % бонуса):';
                }
            }
        } else {
            return 'Выберите уровень и тип камня для установки в экипировку (максимум 2 камня, не одинаковые, уровень влияет на значение бонуса):';
        }
    }
    
    // Обновление значений камней в зависимости от уровня
    function updateStoneValues(level, isWeapon, stoneBonuses) {
        const stoneElements = document.querySelectorAll('.stone-option');
        
        stoneElements.forEach(stoneElement => {
            const stoneId = stoneElement.getAttribute('data-stone');
            const valuesElement = document.getElementById(`stone-${stoneId}-values`);
            
            if (valuesElement) {
                const displayValue = getStoneValueDisplay(stoneId, level, isWeapon, stoneBonuses);
                valuesElement.textContent = displayValue;
                
                if (isWeapon) {
                    valuesElement.style.fontWeight = 'bold';
                    valuesElement.style.color = '#e74c3c';
                } else {
                    valuesElement.style.fontWeight = 'normal';
                    valuesElement.style.color = '';
                }
            }
        });
    }
    
    document.querySelector('.stone-level-option[data-level="1"]')?.classList.add('selected');

    // Обновление отображения выбранных камней
    function updateSelectedStonesDisplay() {
        const stonesList = document.getElementById('stones-list');
        const stoneCounter = document.getElementById('stone-counter');
        const maxStones = getMaxStones(currentSlot);
        
        // Обновляем счетчик
        stoneCounter.textContent = `${selectedStones.length}/${maxStones}`;
        
        if (selectedStones.length === 0) {
            stonesList.innerHTML = 'Не выбрано';
            return;
        }

        // Группируем камни по типу для отображения
        const stoneGroups = {};
        selectedStones.forEach(stone => {
            if (!stoneGroups[stone.id]) {
                stoneGroups[stone.id] = [];
            }
            stoneGroups[stone.id].push(stone.level);
        });

        stonesList.innerHTML = Object.keys(stoneGroups).map(stoneId => {
            const levels = stoneGroups[stoneId];
            const stone = selectedStones.find(s => s.id === stoneId);
            const levelCounts = {};
            
            levels.forEach(level => {
                levelCounts[level] = (levelCounts[level] || 0) + 1;
            });
            
            const levelText = Object.keys(levelCounts).map(level => {
                const count = levelCounts[level];
                return count > 1 ? `${level}×${count}` : `${level}`;
            }).join(', ');
            
            return `<div class="selected-stone-item">${stone.name} (ур. ${levelText})</div>`;
        }).join('');
    }

    // Функция применения выбранной экипировки
    function applyEquipmentSelection(slotType, equipmentType) {
        if (!window.currentEquipmentData || selectedStats.length === 0) {
            console.error('❌ БУСТ НЕ СРАБОТАЛ: Не выбрана экипировка или отсутствуют данные');
            return;
        }

        const selectedIndex = selectedStats[0];
        const selectedEquip = window.currentEquipmentData[selectedIndex];
        
        // Преобразуем статистики экипировки в формат для калькулятора
        const equipmentStats = convertEquipmentStatsToCalculatorFormat(window.currentEquipmentData, selectedIndex);
        
        // Создаем объект с данными экипировки
        const equipmentData = {
            slot: slotType,
            type: selectedEquip.type,
            stats: equipmentStats,
            equipmentType: equipmentType,
            runeLevel: selectedRuneLevel,
            stones: selectedStones,
            quality: selectedQuality,
            weaponType: selectedWeaponType,
            leftHandType: selectedLeftHandType
        };

        if (['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType) && selectedQuality === 'epic') {
            console.log(`💜 Фиолетовая бижутерия ${slotType} не дает базовой брони`);
        }

        // Сохраняем данные экипировки в глобальном хранилище
        if (!window.equipmentData) {
            window.equipmentData = {};
        }
        window.equipmentData[slotType] = equipmentData;

        // Если установлено двуручное оружие, автоматически снимаем левую руку
        if (slotType === 'rhand' && selectedWeaponType === 'two-handed') {
            removeLeftHandEquipment();
        }

        // Обновляем состояние левой руки после изменения оружия
        updateLeftHandState();

        // ПЕРЕДАЕМ ДАННЫЕ ЭКИПИРОВКИ В КАЛЬКУЛЯТОР
        if (window.statCalculator) {
            // Удаляем старые статы для этого слота
            delete window.statCalculator.equipmentStats[slotType];
            
            // Добавляем новые статы
            window.statCalculator.addEquipmentStats(slotType, equipmentStats);
            
            // Устанавливаем уровень рун
            window.statCalculator.setRuneLevel(slotType, selectedRuneLevel);
            
            // Добавляем камни только если они есть
            if (selectedStones.length > 0) {
                window.statCalculator.addStones(slotType, selectedStones);
            }
            
            // Обновляем статистики
            window.statCalculator.updateStats();
        }

        // Передаем камни в калькулятор
        if (selectedStones.length > 0) {
            window.statCalculator.addStones(slotType, selectedStones);
        }

        // Обновляем отображение слота
        updateEquipmentSlotDisplay(slotType, equipmentData);

        // Автосохранение после применения экипировки
        setTimeout(() => {
            if (window.localStorageManager) {
                window.localStorageManager.saveAllData();
            }
        }, 100);

        // Сбрасываем временные переменные
        resetSelectionState();
    }

    // Функция снятия экипировки с левой руки
    function removeLeftHandEquipment() {
        if (window.equipmentData?.lhand) {
            delete window.equipmentData.lhand;
            
            // Обновляем отображение слота левой руки
            const leftHandSlot = document.querySelector('.equipment-slot[data-slot="lhand"]');
            if (leftHandSlot) {
                leftHandSlot.innerHTML = '<div class="slot-label">Левая рука</div>';
                leftHandSlot.classList.remove('equipped');
            }
            
            // Удаляем статы левой руки из калькулятора
            if (window.statCalculator) {
                delete window.statCalculator.equipmentStats.lhand;
                window.statCalculator.updateStats();
            }
            
            console.log('Экипировка с левой руки автоматически снята из-за двуручного оружия');
        }
    }

    // Функция обновления отображения слота экипировки
    function updateEquipmentSlotDisplay(slotType, equipmentData) {
        const slotElement = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
        
        if (!slotElement) {
            console.error(`Слот ${slotType} не найден`);
            return;
        }

        // Очищаем слот
        slotElement.innerHTML = '';
        slotElement.classList.add('equipped');

        // Получаем текущий класс
        const currentClass = getCurrentCharacterClass();
        
        // Получаем путь к иконке в зависимости от типа экипировки
        let iconPath = '';
        
        if (['chest', 'helm', 'shoulders', 'pants', 'boots', 'hands', 'belt', 'bracers'].includes(slotType)) {
            // Обычная экипировка
            iconPath = getEquipmentIconPath(slotType, equipmentData.equipmentType, currentClass);
        } else if (slotType === 'rhand') {
            // Оружие - используем рандомную иконку
            iconPath = getWeaponIconPath(equipmentData.weaponType, currentClass, equipmentData.equipmentType);
        } else if (slotType === 'lhand' && equipmentData.leftHandType === 'shield') {
            // Щит
            iconPath = getShieldIconPath(currentClass, equipmentData.equipmentType);
        } else if (slotType === 'lhand' && equipmentData.leftHandType === 'weapon') {
            // Второе оружие - используем рандомную иконку для одноручного оружия
            iconPath = getWeaponIconPath('one-handed', currentClass, equipmentData.equipmentType);
        } else if (['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'].includes(slotType)) {
            // Бижутерия - используем рандомную иконку для бижутерии
            iconPath = getJewelryIconPath(slotType, equipmentData.quality, equipmentData.equipmentType);
        } else if (slotType === 'cape') {
            // Плащ
            iconPath = getCapeIconPath(equipmentData.quality, equipmentData.equipmentType);
        } else {
            // Запасной вариант
            iconPath = `/static/Ico/Button_Char/${getSlotIcon(slotType)}`;
        }

        // Создаем элемент изображения
        const img = document.createElement('img');
        img.src = iconPath;
        img.alt = equipmentData.type;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.objectFit = 'contain';
        img.style.marginBottom = '8px';
        
        // Добавляем обработчик ошибки загрузки изображения
        img.onerror = function() {
            console.warn(`Не удалось загрузить иконку: ${iconPath}`);
            // Используем стандартную иконку в случае ошибки
            this.src = `/static/Ico/Button_Char/${getSlotIcon(slotType)}`;
        };

        slotElement.appendChild(img);

        // Добавляем название экипировки
        const nameElement = document.createElement('span');
        nameElement.textContent = equipmentData.type;
        nameElement.style.fontSize = '11px';
        nameElement.style.fontWeight = '600';
        nameElement.style.color = 'var(--dark)';
        nameElement.style.textAlign = 'center';
        nameElement.style.lineHeight = '1.2';
        nameElement.style.maxWidth = '80px';
        nameElement.style.wordWrap = 'break-word';
        slotElement.appendChild(nameElement);

        // Добавляем информацию о качестве (только для плаща)
        if (slotType === 'cape' && equipmentData.quality) {
            const qualityBadge = document.createElement('div');
            qualityBadge.className = `quality-badge quality-${equipmentData.quality}`;
            qualityBadge.textContent = equipmentData.quality === 'orange' ? 'О' : 'К';
            qualityBadge.style.position = 'absolute';
            qualityBadge.style.top = '5px';
            qualityBadge.style.right = '5px';
            qualityBadge.style.background = equipmentData.quality === 'orange' ? 'var(--warning)' : 'var(--accent)';
            qualityBadge.style.color = 'white';
            qualityBadge.style.borderRadius = '50%';
            qualityBadge.style.width = '16px';
            qualityBadge.style.height = '16px';
            qualityBadge.style.fontSize = '10px';
            qualityBadge.style.display = 'flex';
            qualityBadge.style.alignItems = 'center';
            qualityBadge.style.justifyContent = 'center';
            qualityBadge.style.fontWeight = 'bold';
            slotElement.appendChild(qualityBadge);
        }

        // Добавляем информацию о типе оружия
        if (slotType === 'rhand' && equipmentData.weaponType) {
            const weaponTypeBadge = document.createElement('div');
            weaponTypeBadge.className = `weapon-type-badge ${equipmentData.weaponType}`;
            weaponTypeBadge.textContent = equipmentData.weaponType === 'one-handed' ? '1H' : '2H';
            weaponTypeBadge.style.position = 'absolute';
            weaponTypeBadge.style.top = '5px';
            weaponTypeBadge.style.left = '5px';
            weaponTypeBadge.style.background = 'var(--primary)';
            weaponTypeBadge.style.color = 'white';
            weaponTypeBadge.style.borderRadius = '4px';
            weaponTypeBadge.style.padding = '2px 4px';
            weaponTypeBadge.style.fontSize = '9px';
            weaponTypeBadge.style.fontWeight = 'bold';
            slotElement.appendChild(weaponTypeBadge);
        }

        // Добавляем информацию о типе левой руки
        if (slotType === 'lhand' && equipmentData.leftHandType) {
            const leftHandBadge = document.createElement('div');
            leftHandBadge.className = `left-hand-badge ${equipmentData.leftHandType}`;
            leftHandBadge.textContent = equipmentData.leftHandType === 'shield' ? '🛡️' : '⚔️';
            leftHandBadge.style.position = 'absolute';
            leftHandBadge.style.top = '5px';
            leftHandBadge.style.left = '5px';
            leftHandBadge.style.fontSize = '12px';
            slotElement.appendChild(leftHandBadge);
        }

        // Добавляем информацию о рунах
        if (equipmentData.runeLevel > 0) {
            const runeBadge = document.createElement('div');
            runeBadge.className = 'rune-badge';
            runeBadge.textContent = `+${equipmentData.runeLevel}`;
            runeBadge.style.position = 'absolute';
            runeBadge.style.bottom = '5px';
            runeBadge.style.right = '5px';
            runeBadge.style.background = 'var(--secondary)';
            runeBadge.style.color = 'white';
            runeBadge.style.borderRadius = '4px';
            runeBadge.style.padding = '2px 4px';
            runeBadge.style.fontSize = '10px';
            runeBadge.style.fontWeight = 'bold';
            slotElement.appendChild(runeBadge);
        }

        // Добавляем информацию о камнях
        if (equipmentData.stones && equipmentData.stones.length > 0) {
            const stoneBadge = document.createElement('div');
            stoneBadge.className = 'stone-badge';
            
            // Определяем тип иконки камня в зависимости от слота и уровня камней
            const stoneIconPath = getStoneIconPath(slotType, equipmentData.stones);
            
            const stoneImg = document.createElement('img');
            stoneImg.src = stoneIconPath;
            stoneImg.alt = 'Камни';
            stoneImg.style.width = '20px';
            stoneImg.style.height = '20px';
            stoneImg.style.objectFit = 'contain';
            
            stoneBadge.appendChild(stoneImg);
            stoneBadge.style.position = 'absolute';
            stoneBadge.style.bottom = '0px';
            stoneBadge.style.left = '5px';
            // stoneBadge.style.background = 'var(--warning)';
            stoneBadge.style.borderRadius = '4px';
            stoneBadge.style.padding = '2px';
            stoneBadge.style.display = 'flex';
            stoneBadge.style.alignItems = 'center';
            stoneBadge.style.justifyContent = 'center';
            
            slotElement.appendChild(stoneBadge);
        }

        // Добавляем информацию о типе экипировки (3/4 стата)
        const typeBadge = document.createElement('div');
        typeBadge.className = 'type-badge';
        typeBadge.textContent = equipmentData.equipmentType === '4-stat' ? '4S' : '3S';
        typeBadge.style.position = 'absolute';
        typeBadge.style.top = '5px';
        typeBadge.style.right = slotType === 'cape' ? '25px' : '5px';
        typeBadge.style.background = 'var(--dark)';
        typeBadge.style.color = 'white';
        typeBadge.style.borderRadius = '4px';
        typeBadge.style.padding = '2px 4px';
        typeBadge.style.fontSize = '10px';
        typeBadge.style.fontWeight = 'bold';
        slotElement.appendChild(typeBadge);
    }

    // Новая функция для получения пути к иконке камней
    function getStoneIconPath(slotType, stones) {
        if (!stones || stones.length === 0) {
            return '';
        }
        
        // Определяем средний уровень камней
        const averageLevel = Math.ceil(stones.reduce((sum, stone) => sum + stone.level, 0) / stones.length);
        const level = Math.min(Math.max(averageLevel, 1), 5);
        
        // Определяем тип иконки в зависимости от слота
        if (['rhand', 'lhand'].includes(slotType)) {
            // Оружие и щит
            return `/static/Ico/Stones/gem_weapon_${level}.svg`;
        } else if (['helm', 'shoulders', 'chest', 'pants'].includes(slotType)) {
            // Левая сторона: Голова, Плечи, Роба, Штаны
            return `/static/Ico/Stones/gem_left_side_lvl_${level}.svg`;
        } else {
            // Правая сторона: Перчатки, Наручи, Сапоги, Пояс
            return `/static/Ico/Stones/gem_right_side_lvl_${level}.svg`;
        }
    }

    // Функция сброса состояния выбора
    function resetSelectionState() {
        selectedStats = [];
        selectedEquipmentType = '';
        selectedRuneLevel = 0;
        selectedStones = [];
        selectedQuality = '';
        selectedWeaponType = '';
        selectedLeftHandType = '';
    }

    // Функция закрытия модального окна
    function closeModal() {
        equipmentModal.style.display = 'none';
        resetSelectionState();
    }

    // Обработчик клика вне модального окна
    equipmentModal.addEventListener('click', function(event) {
        if (event.target === equipmentModal) {
            closeModal();
        }
    });
    
    window.updateEquipmentSlotDisplay = updateEquipmentSlotDisplay;
    window.updateAllEquipmentSlots = updateAllEquipmentSlots;
    window.updateLeftHandState = updateLeftHandState;
});