// equipment_selectors.js
// Функции для открытия различных селекторов

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
    window.selectedWeaponType = 'one-handed';
    window.selectedLeftHandType = 'shield';
    openEquipmentStatsSelector(slotType, null, null);
}

function openSecondWeaponSelector(slotType) {
    window.selectedWeaponType = 'one-handed';
    window.selectedLeftHandType = 'weapon';
    openEquipmentStatsSelector(slotType, null, null);
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
            openEquipmentStatsSelector(slotType, null, null);
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
            openEquipmentStatsSelector(slotType, null, null);
        }
    });

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}

function openEquipmentTypeSelector(slotType, dataFile) {
    const slotNames = {
        'chest': 'Робы', 'helm': 'Шлема', 'shoulders': 'Наплечников',
        'pants': 'Штанов', 'boots': 'Сапог', 'hands': 'Перчаток',
        'bracers': 'Наручей', 'belt': 'Пояса', 'cape': 'Плаща',
        'neck': 'Ожерелья', 'ring1': 'Кольца', 'ring2': 'Кольца',
        'trinket1': 'Амулета', 'trinket2': 'Амулета',
        'rhand': 'Оружия', 'rlhand': 'Оружия', 'lhand': 'Оружия', 'Shield': 'Щит'
    };

    let weaponInfo = '';
    if (slotType === 'rhand' && window.selectedWeaponType) {
        weaponInfo = `<p class="weapon-info">Тип: ${EquipmentConfig.weaponTypeNames[window.selectedWeaponType]}</p>`;
    }

    window.modalContent.innerHTML = `
        <h2 class="modal-title">Выбор ${slotNames[slotType] || 'экипировки'}</h2>
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
            ${slotType === 'rhand' ? '<button id="back-to-weapon-type" class="modal-button button-back">← Назад</button>' : ''}
            <button id="confirm-type" class="modal-button button-confirm" disabled>Далее</button>
        </div>
    `;

    let selectedType = null;

    document.querySelectorAll('.equipment-type-option').forEach(option => {
        option.addEventListener('click', function() {
            if (selectedType) selectedType.classList.remove('selected');
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

    if (slotType === 'rhand') {
        document.getElementById('back-to-weapon-type').addEventListener('click', function() {
            openWeaponTypeSelector(slotType, dataFile);
        });
    }

    document.getElementById('cancel-selection').addEventListener('click', window.closeModal);
    window.equipmentModal.style.display = 'flex';
}