// equipment_utils.js
// Вспомогательные функции

function getCurrentCharacterClass() {
    const activeClassButton = document.querySelector('.class-btn.active');
    if (activeClassButton) {
        return activeClassButton.getAttribute('data-class') || 'warrior';
    }
    return window.currentClass || 'warrior';
}

function filterEquipmentByClass(equipmentData, characterClass) {
    if (!equipmentData || !characterClass) return equipmentData;
    
    return equipmentData.filter(equip => {
        if (!equip.classes) return true;
        return equip.classes.includes(characterClass);
    });
}

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
                classes: classes.split(',').map(c => c.trim()).filter(c => c)
            });
        }
    }
    
    return equipmentData;
}

function convertEquipmentStatsToCalculatorFormat(equipmentData, selectedIndex) {
    const selectedEquip = equipmentData[selectedIndex];
    const stats = {};
    
    selectedEquip.stats.forEach(statLine => {
        const match = statLine.match(/(.+?)\s*\+(\d+)/);
        if (match) {
            const statName = match[1].trim();
            const statValue = parseInt(match[2]);
            const englishKey = EquipmentConfig.statMapping[statName];
            
            if (englishKey) {
                stats[englishKey] = statValue;
            } else {
                console.warn('Неизвестная характеристика:', statName);
            }
        }
    });
    
    return stats;
}

function getWeaponDataFile(weaponType) {
    return weaponType === 'two-handed' ? 'Оружие2.xml' : 'Оружие.xml';
}

function getMaxStones(slotType, isTwoHandedWeapon = false) {
    if (EquipmentConfig.skipStonesSlots.includes(slotType)) {
        return 0;
    }
    
    if (slotType === 'rhand') {
        return isTwoHandedWeapon ? 6 : 3;
    } else if (slotType === 'lhand' && window.selectedLeftHandType === 'weapon') {
        return 3;
    } else if (slotType === 'lhand' && window.selectedLeftHandType === 'shield') {
        return 3;
    } else {
        return 2;
    }
}

function canUseShield() {
    const currentClass = getCurrentCharacterClass();
    const rightHandEquipment = window.equipmentData?.rhand;
    
    if (rightHandEquipment && rightHandEquipment.weaponType === 'two-handed') {
        return false;
    }
    
    return EquipmentConfig.shieldClasses.includes(currentClass);
}

function canDualWield() {
    const currentClass = getCurrentCharacterClass();
    const rightHandEquipment = window.equipmentData?.rhand;
    
    if (rightHandEquipment && rightHandEquipment.weaponType === 'two-handed') {
        return false;
    }
    
    return EquipmentConfig.dualWieldClasses.includes(currentClass);
}

function getShieldCompatibilityInfo(currentClass) {
    if (EquipmentConfig.shieldClasses.includes(currentClass)) {
        return `<span style="color: var(--secondary);">✓ Доступно для ${EquipmentConfig.classNames[currentClass]}</span>`;
    } else {
        return `<span style="color: var(--accent);">✗ Недоступно для ${EquipmentConfig.classNames[currentClass]}</span>`;
    }
}

function getDualWieldCompatibilityInfo(currentClass) {
    if (EquipmentConfig.dualWieldClasses.includes(currentClass)) {
        return `<span style="color: var(--secondary);">✓ Доступно для ${EquipmentConfig.classNames[currentClass]}</span>`;
    } else {
        return `<span style="color: var(--accent);">✗ Недоступно для ${EquipmentConfig.classNames[currentClass]}</span>`;
    }
}

function showDualWieldRestrictionMessage() {
    const currentClass = getCurrentCharacterClass();
    const rightHandEquipment = window.equipmentData?.rhand;
    
    if (rightHandEquipment && rightHandEquipment.weaponType === 'two-handed') {
        alert('Невозможно использовать два оружия с двуручным оружием. Сначала смените оружие на одноручное.');
        return false;
    } else if (!EquipmentConfig.dualWieldClasses.includes(currentClass)) {
        alert(`Класс "${EquipmentConfig.classNames[currentClass]}" не может использовать два оружия. Только Разбойники, Воины и Жрецы могут использовать два оружия одновременно.`);
        return false;
    }
    
    return true;
}

function showShieldRestrictionMessage() {
    const currentClass = getCurrentCharacterClass();
    
    if (!EquipmentConfig.shieldClasses.includes(currentClass)) {
        alert(`Класс "${EquipmentConfig.classNames[currentClass]}" не может использовать щит. Только Воины и Жрецы могут использовать щиты.`);
        return false;
    }
    
    return true;
}

function removeLeftHandEquipment() {
    if (window.equipmentData?.lhand) {
        delete window.equipmentData.lhand;
        
        const leftHandSlot = document.querySelector('.equipment-slot[data-slot="lhand"]');
        if (leftHandSlot) {
            leftHandSlot.innerHTML = `
                <img src="/static/Ico/Button_Char/11_Lhand.svg" alt="Щит">
                <span>Щит</span>
            `;
            leftHandSlot.classList.remove('equipped');
        }
        
        if (window.statCalculator) {
            delete window.statCalculator.equipmentStats.lhand;
            window.statCalculator.updateStats();
        }
        
        console.log('Экипировка с левой руки автоматически снята из-за двуручного оружия');
    }
}