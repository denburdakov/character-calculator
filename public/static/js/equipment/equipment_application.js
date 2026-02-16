// equipment_application.js
// Функции для применения выбранной экипировки

function applyEquipmentSelection(slotType, equipmentType) {
    if (!window.currentEquipmentData || window.selectedStats.length === 0) {
        console.error('❌ БУСТ НЕ СРАБОТАЛ: Не выбрана экипировка или отсутствуют данные');
        return;
    }

    const selectedIndex = window.selectedStats[0];
    const selectedEquip = window.currentEquipmentData[selectedIndex];
    
    const equipmentStats = convertEquipmentStatsToCalculatorFormat(window.currentEquipmentData, selectedIndex);
    
    const equipmentData = {
        slot: slotType,
        type: selectedEquip.type,
        stats: equipmentStats,
        equipmentType: equipmentType,
        runeLevel: window.selectedRuneLevel || 0,
        stones: window.selectedStones || [],
        quality: window.selectedQuality,
        weaponType: window.selectedWeaponType,
        leftHandType: window.selectedLeftHandType
    };

    if (!window.equipmentData) {
        window.equipmentData = {};
    }
    window.equipmentData[slotType] = equipmentData;

    if (slotType === 'rhand' && window.selectedWeaponType === 'two-handed') {
        removeLeftHandEquipment();
    }

    window.updateLeftHandState();

    if (window.statCalculator) {
        delete window.statCalculator.equipmentStats[slotType];
        window.statCalculator.addEquipmentStats(slotType, equipmentStats);
        window.statCalculator.setRuneLevel(slotType, window.selectedRuneLevel || 0);
        
        if (window.selectedStones && window.selectedStones.length > 0) {
            window.statCalculator.addStones(slotType, window.selectedStones);
        }
        
        window.statCalculator.updateStats();
    }

    updateEquipmentSlotDisplay(slotType, equipmentData);

    setTimeout(() => {
        if (window.localStorageManager) {
            window.localStorageManager.saveAllData();
        }
    }, 100);

    window.resetSelectionState();
}

function updateEquipmentSlotDisplay(slotType, equipmentData) {
    const slotElement = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
    
    if (!slotElement) {
        console.error(`Слот ${slotType} не найден`);
        return;
    }

    slotElement.innerHTML = '';
    slotElement.classList.add('equipped');

    const currentClass = getCurrentCharacterClass();
    
    let iconPath = '';
    
    if (['chest', 'helm', 'shoulders', 'pants', 'boots', 'hands', 'belt', 'bracers'].includes(slotType)) {
        iconPath = getEquipmentIconPath(slotType, equipmentData.equipmentType, currentClass);
    } else if (slotType === 'rhand') {
        iconPath = getWeaponIconPath(equipmentData.weaponType, currentClass, equipmentData.equipmentType);
    } else if (slotType === 'lhand' && equipmentData.leftHandType === 'shield') {
        iconPath = getShieldIconPath(currentClass, equipmentData.equipmentType);
    } else if (slotType === 'lhand' && equipmentData.leftHandType === 'weapon') {
        iconPath = getWeaponIconPath('one-handed', currentClass, equipmentData.equipmentType);
    } else if (EquipmentConfig.jewelrySlots.includes(slotType)) {
        iconPath = getJewelryIconPath(slotType, equipmentData.quality, equipmentData.equipmentType);
    } else if (slotType === 'cape') {
        iconPath = getCapeIconPath(equipmentData.quality, equipmentData.equipmentType);
    } else {
        iconPath = `/static/Ico/Button_Char/${getSlotIcon(slotType)}`;
    }

    const img = document.createElement('img');
    img.src = iconPath;
    img.alt = equipmentData.type;
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.objectFit = 'contain';
    img.style.marginBottom = '8px';
    
    img.onerror = function() {
        console.warn(`Не удалось загрузить иконку: ${iconPath}`);
        this.src = `/static/Ico/Button_Char/${getSlotIcon(slotType)}`;
    };

    slotElement.appendChild(img);

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

    if (equipmentData.stones && equipmentData.stones.length > 0) {
        const stoneBadge = document.createElement('div');
        stoneBadge.className = 'stone-badge';
        
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
        stoneBadge.style.borderRadius = '4px';
        stoneBadge.style.padding = '2px';
        stoneBadge.style.display = 'flex';
        stoneBadge.style.alignItems = 'center';
        stoneBadge.style.justifyContent = 'center';
        
        slotElement.appendChild(stoneBadge);
    }

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