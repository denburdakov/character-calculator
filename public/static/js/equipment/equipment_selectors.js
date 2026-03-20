// equipment_selectors.js
// Функции для открытия различных селекторов

function openJewelryQualitySelector(slotType, dataFile) {
    const slotNames = {
        'neck': 'Ожерелья',
        'ring1': 'Кольца',
        'ring2': 'Кольца', 
        'trinket1': 'Амулета',
        'trinket2': 'Амулета'
    };

    window.modalContent.innerHTML = `
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
            window.selectedQuality = this.getAttribute('data-quality');

            document.getElementById('confirm-jewelry-quality').disabled = false;
        });
    });

    document.getElementById('confirm-jewelry-quality').addEventListener('click', function() {
        if (selectedQualityOption) {
            openEquipmentTypeSelector(slotType, dataFile);
        }
    });

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}

function openLeftHandTypeSelector(slotType) {
    const currentClass = getCurrentCharacterClass();
    
    window.modalContent.innerHTML = `
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
            window.selectedLeftHandType = selectedType;
        });
    });

    document.getElementById('confirm-left-hand-type').addEventListener('click', function() {
        if (selectedTypeOption) {
            if (window.selectedLeftHandType === 'shield') {
                openShieldSelector(slotType);
            } else {
                openSecondWeaponSelector(slotType);
            }
        }
    });

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}

function openShieldSelector(slotType) {
    const dataFile = 'Щит.xml';
    
    window.modalContent.innerHTML = `
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
            window.selectedEquipmentType = this.getAttribute('data-type');

            document.getElementById('confirm-shield-type').disabled = false;
        });
    });

    document.getElementById('confirm-shield-type').addEventListener('click', function() {
        if (selectedType) {
            loadEquipmentDataFromXML(slotType, dataFile, window.selectedEquipmentType);
        }
    });

    document.getElementById('back-to-left-hand-type').addEventListener('click', function() {
        openLeftHandTypeSelector(slotType);
    });

    window.equipmentModal.style.display = 'flex';
}

function openSecondWeaponSelector(slotType) {
    const dataFile = 'Оружие.xml';
    
    window.modalContent.innerHTML = `
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
            window.selectedEquipmentType = this.getAttribute('data-type');

            document.getElementById('confirm-weapon-type').disabled = false;
        });
    });

    document.getElementById('confirm-weapon-type').addEventListener('click', function() {
        if (selectedType) {
            window.selectedWeaponType = 'one-handed';
            loadEquipmentDataFromXML(slotType, dataFile, window.selectedEquipmentType);
        }
    });

    document.getElementById('back-to-left-hand-type').addEventListener('click', function() {
        openLeftHandTypeSelector(slotType);
    });

    window.equipmentModal.style.display = 'flex';
}

function openQualitySelector(slotType, dataFile) {
    window.modalContent.innerHTML = `
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
            window.selectedQuality = this.getAttribute('data-quality');

            document.getElementById('confirm-quality').disabled = false;
        });
    });

    document.getElementById('confirm-quality').addEventListener('click', function() {
        if (selectedQualityOption) {
            openEquipmentTypeSelector(slotType, dataFile);
        }
    });

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}

function openWeaponTypeSelector(slotType, dataFile) {
    const currentClass = window.currentClass || 'warrior';
    const availableTypes = EquipmentConfig.weaponTypesByClass[currentClass] || ['one-handed', 'two-handed'];
    
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
        restrictionMessage = `<p class="weapon-info">Класс "${EquipmentConfig.classNames[currentClass]}" может использовать только ${availableTypes[0] === 'one-handed' ? 'одноручное' : 'двуручное'} оружие</p>`;
    }

    window.modalContent.innerHTML = `
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

    if (availableTypes.length === 1) {
        window.selectedWeaponType = availableTypes[0];
        setTimeout(() => {
            openEquipmentTypeSelector(slotType, getWeaponDataFile(window.selectedWeaponType));
        }, 100);
        return;
    }

    let selectedWeaponTypeOption = null;

    document.querySelectorAll('.weapon-type-option').forEach(option => {
        option.addEventListener('click', function() {
            if (selectedWeaponTypeOption) {
                selectedWeaponTypeOption.classList.remove('selected');
            }

            this.classList.add('selected');
            selectedWeaponTypeOption = this;
            window.selectedWeaponType = this.getAttribute('data-weapon-type');

            document.getElementById('confirm-weapon-type').disabled = false;
        });
    });

    document.getElementById('confirm-weapon-type').addEventListener('click', function() {
        if (selectedWeaponTypeOption) {
            openEquipmentTypeSelector(slotType, getWeaponDataFile(window.selectedWeaponType));
        }
    });

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}

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
    if (slotType === 'cape' && window.selectedQuality) {
        qualityInfo = `<p class="quality-info">Качество: ${EquipmentConfig.qualityNames[window.selectedQuality]}</p>`;
    }
    
    if (EquipmentConfig.jewelrySlots.includes(slotType) && window.selectedQuality) {
        qualityInfo = `<p class="quality-info">Качество: ${EquipmentConfig.qualityNames[window.selectedQuality]}</p>`;
    }

    let weaponInfo = '';
    if (slotType === 'rhand' && window.selectedWeaponType) {
        weaponInfo = `<p class="weapon-info">Тип: ${EquipmentConfig.weaponTypeNames[window.selectedWeaponType]}</p>`;
    }

    window.modalContent.innerHTML = `
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
            ${EquipmentConfig.jewelrySlots.includes(slotType) ? '<button id="back-to-jewelry-quality" class="modal-button button-back">← Назад</button>' : ''}
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
            window.selectedEquipmentType = this.getAttribute('data-type');

            document.getElementById('confirm-type').disabled = false;
        });
    });

    document.getElementById('confirm-type').addEventListener('click', function() {
        if (selectedType) {
            loadEquipmentDataFromXML(slotType, dataFile, window.selectedEquipmentType);
        }
    });

    if (slotType === 'cape') {
        document.getElementById('back-to-quality').addEventListener('click', function() {
            window.selectedEquipmentType = '';
            openQualitySelector(slotType, dataFile);
        });
    }

    if (EquipmentConfig.jewelrySlots.includes(slotType)) {
        document.getElementById('back-to-jewelry-quality').addEventListener('click', function() {
            window.selectedEquipmentType = '';
            openJewelryQualitySelector(slotType, dataFile);
        });
    }

    if (slotType === 'rhand') {
        document.getElementById('back-to-weapon-type').addEventListener('click', function() {
            openWeaponTypeSelector(slotType, dataFile);
        });
    }

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}