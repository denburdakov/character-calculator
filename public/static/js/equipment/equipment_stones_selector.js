// equipment_stones_selector.js
// Функции для выбора камней

function openStoneSelector(slotType, equipmentType) {
    const isWeaponOrShield = EquipmentConfig.weaponSlots.includes(slotType) || 
                            (slotType === 'lhand' && window.selectedLeftHandType === 'weapon') ||
                            (slotType === 'lhand' && window.selectedLeftHandType === 'shield');
    
    let isTwoHandedWeapon = false;
    
    if (slotType === 'rhand') {
        isTwoHandedWeapon = window.selectedWeaponType === 'two-handed';
    }
    
    if (EquipmentConfig.skipStonesSlots.includes(slotType)) {
        applyEquipmentSelection(slotType, equipmentType);
        window.closeModal();
        return;
    }

    const stoneBonuses = window.statCalculator?.stoneCalculator?.getStoneBonuses?.() || {};
    
    const stones = isWeaponOrShield ? StonesData.weapon : StonesData.regular;
    const stoneLevels = [1, 2, 3, 4, 5];

    let qualityInfo = '';
    if (slotType === 'cape' && window.selectedQuality) {
        qualityInfo = `<p class="quality-info">Качество: ${EquipmentConfig.qualityNames[window.selectedQuality]}</p>`;
    }

    let weaponInfo = '';
    if (slotType === 'rhand' && window.selectedWeaponType) {
        weaponInfo = `<p class="weapon-info">Тип: ${EquipmentConfig.weaponTypeNames[window.selectedWeaponType]}</p>`;
    }

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

    window.modalContent.innerHTML = `
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

    updateStoneValues(1, isWeaponOrShield, stoneBonuses);
    
    window.selectedStones = [];
    let currentStoneLevel = 1;

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

    document.querySelector('.stone-level-option[data-level="1"]')?.classList.add('selected');

    document.querySelectorAll('.stone-option').forEach(option => {
        option.addEventListener('click', function() {
            const stoneId = this.getAttribute('data-stone');
            const stone = stones.find(s => s.id === stoneId);
            const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
            
            if (window.selectedStones.length >= maxStones) {
                alert(`Можно выбрать не более ${maxStones} камней`);
                return;
            }
            
            if (isWeaponOrShield) {
                const sameStoneCount = window.selectedStones.filter(s => s.id === stoneId).length;
                if (sameStoneCount >= 2) {
                    alert('Можно установить максимум 2 одинаковых камня в оружие');
                    return;
                }
            } else {
                const sameStoneExists = window.selectedStones.some(s => s.id === stoneId);
                if (sameStoneExists) {
                    alert('Нельзя устанавливать одинаковые камни в обычную экипировку');
                    return;
                }
            }
            
            window.selectedStones.push({
                id: stoneId,
                level: currentStoneLevel,
                name: stone.name,
                isPercentage: isWeaponOrShield
            });
            
            const counterElement = document.getElementById(`stone-${stoneId}-counter`);
            const currentCount = parseInt(counterElement.textContent) || 0;
            counterElement.textContent = currentCount + 1;
            
            this.style.borderColor = stone.color;
            this.style.backgroundColor = `${stone.color}40`;
            this.classList.add('selected');

            updateSelectedStonesDisplay(slotType, isTwoHandedWeapon);
        });
    });

    document.getElementById('reset-stones').addEventListener('click', function() {
        window.selectedStones = [];
        
        stones.forEach(stone => {
            const counterElement = document.getElementById(`stone-${stone.id}-counter`);
            if (counterElement) counterElement.textContent = '0';
            
            const stoneOption = document.querySelector(`.stone-option[data-stone="${stone.id}"]`);
            if (stoneOption) {
                stoneOption.style.borderColor = `${stone.color}40`;
                stoneOption.style.backgroundColor = `${stone.color}20`;
                stoneOption.classList.remove('selected');
            }
        });
        
        updateSelectedStonesDisplay(slotType, isTwoHandedWeapon);
    });

    document.getElementById('skip-stones').addEventListener('click', function() {
        window.selectedStones = [];
        applyEquipmentSelection(slotType, equipmentType);
        window.closeModal();
    });

    document.getElementById('back-to-runes').addEventListener('click', function() {
        openRuneSelector(slotType, equipmentType);
    });

    document.getElementById('confirm-stones').addEventListener('click', function() {
        if (window.currentEquipmentData && window.selectedStats.length > 0) {
            applyEquipmentSelection(slotType, equipmentType);
            window.closeModal();
        } else {
            console.error('Не выбрана экипировка или отсутствуют данные');
            alert('Пожалуйста, выберите тип экипировки');
        }
    });

    window.equipmentModal.style.display = 'flex';
}

function getStoneValueDisplay(stoneId, level, isWeapon, stoneBonuses) {
    const stoneData = stoneBonuses[stoneId];
    if (!stoneData || !stoneData.values) {
        return isWeapon ? '+0%' : '+0 ед.';
    }
    
    const value = stoneData.values[level - 1];
    return isWeapon ? `+${value}%` : `+${value} ед.`;
}

function getStoneSubtitle(slotType, isWeapon = false, isTwoHandedWeapon = false) {
    if (EquipmentConfig.skipStonesSlots.includes(slotType)) {
        return 'Камни не доступны для этого типа экипировки';
    }
    
    const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
    
    if (isWeapon) {
        if (maxStones === 6) {
            return 'Выберите уровень и тип камня для установки в двуручное оружие (максимум 6 камней, можно до 2 одинаковых, уровень влияет на % бонуса):';
        } else if (maxStones === 3) {
            if (slotType === 'lhand' && window.selectedLeftHandType === 'shield') {
                return 'Выберите уровень и тип камня для установки в щит (максимум 3 камня, можно до 2 одинаковых, уровень влияет на % бонуса):';
            } else {
                return 'Выберите уровень и тип камня для установки в оружие (максимум 3 камня, можно до 2 одинаковых, уровень влияет на % бонуса):';
            }
        }
    } else {
        return 'Выберите уровень и тип камня для установки в экипировку (максимум 2 камня, не одинаковые, уровень влияет на значение бонуса):';
    }
}

function updateStoneValues(level, isWeapon, stoneBonuses) {
    const stoneElements = document.querySelectorAll('.stone-option');
    
    stoneElements.forEach(stoneElement => {
        const stoneId = stoneElement.getAttribute('data-stone');
        const valuesElement = document.getElementById(`stone-${stoneId}-values`);
        
        if (valuesElement) {
            const displayValue = getStoneValueDisplay(stoneId, level, isWeapon, stoneBonuses);
            valuesElement.textContent = displayValue;
        }
    });
}

function updateSelectedStonesDisplay(slotType, isTwoHandedWeapon) {
    const stonesList = document.getElementById('stones-list');
    const stoneCounter = document.getElementById('stone-counter');
    const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
    
    stoneCounter.textContent = `${window.selectedStones.length}/${maxStones}`;
    
    if (window.selectedStones.length === 0) {
        stonesList.innerHTML = 'Не выбрано';
        return;
    }

    const stoneGroups = {};
    window.selectedStones.forEach(stone => {
        if (!stoneGroups[stone.id]) {
            stoneGroups[stone.id] = [];
        }
        stoneGroups[stone.id].push(stone.level);
    });

    stonesList.innerHTML = Object.keys(stoneGroups).map(stoneId => {
        const levels = stoneGroups[stoneId];
        const stone = window.selectedStones.find(s => s.id === stoneId);
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