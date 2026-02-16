// equipment_icons.js
// Функции для получения путей к иконкам экипировки

function getEquipmentIconPath(slotType, equipmentType, className) {
    const classFolder = EquipmentConfig.classFolders[className] || 'Warrior';
    const slotIcon = EquipmentConfig.slotIcons[slotType] || 'Chest';
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    return `/static/Ico/Classes/${classFolder}/${setType}/${slotIcon}.svg`;
}

function getWeaponIconPath(weaponType, className, equipmentType) {
    const classFolder = EquipmentConfig.classFolders[className] || 'Warrior';
    const weaponFolder = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    let weaponIcon = 'Weapon';
    const weaponIcons = EquipmentConfig.weaponIcons;
    
    if (className === 'rogue') {
        weaponIcon = weaponIcons.rogue[Math.floor(Math.random() * weaponIcons.rogue.length)];
    } else if (className === 'mage') {
        weaponIcon = weaponIcons.mage[Math.floor(Math.random() * weaponIcons.mage.length)];
    } else if (className === 'warrior') {
        if (weaponType === 'two-handed') {
            weaponIcon = weaponIcons.warrior['two-handed'][Math.floor(Math.random() * weaponIcons.warrior['two-handed'].length)];
        } else {
            weaponIcon = weaponIcons.warrior['one-handed'][Math.floor(Math.random() * weaponIcons.warrior['one-handed'].length)];
        }
    } else if (className === 'priest') {
        if (weaponType === 'two-handed') {
            weaponIcon = weaponIcons.priest['two-handed'][Math.floor(Math.random() * weaponIcons.priest['two-handed'].length)];
        } else {
            weaponIcon = weaponIcons.priest['one-handed'][Math.floor(Math.random() * weaponIcons.priest['one-handed'].length)];
        }
    } else if (className === 'archer') {
        weaponIcon = weaponIcons.archer[Math.floor(Math.random() * weaponIcons.archer.length)];
    }
    
    return `/static/Ico/Classes/${classFolder}/${weaponFolder}/${weaponIcon}.svg`;
}

function getShieldIconPath(className, equipmentType) {
    const classFolder = EquipmentConfig.classFolders[className] || 'Warrior';
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    return `/static/Ico/Classes/${classFolder}/${setType}/Shield.svg`;
}

function getJewelryIconPath(slotType, quality, equipmentType) {
    const qualityFolder = quality === 'orange' ? 'orange' : 'purple';
    const slotIcon = slotType === 'neck' ? 'Neck' : 
                    (slotType.startsWith('ring') ? 'Ring' : 'Trinket');
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    return `/static/Ico/Classes/Jewelry/${qualityFolder}/${slotIcon}/${setType}/${slotIcon}.svg`;
}

function getCapeIconPath(quality, equipmentType) {
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    if (quality === 'red') {
        return `/static/Ico/Classes/Cape/red/${setType}/Cape.svg`;
    } else {
        return `/static/Ico/Classes/Cape/orange/${setType}/Cape.svg`;
    }
}

function getStoneIconPath(slotType, stones) {
    if (!stones || stones.length === 0) return '';
    
    const averageLevel = Math.ceil(stones.reduce((sum, stone) => sum + stone.level, 0) / stones.length);
    const level = Math.min(Math.max(averageLevel, 1), 5);
    
    if (['rhand', 'lhand'].includes(slotType)) {
        return `/static/Ico/Stones/gem_weapon_${level}.svg`;
    } else if (['helm', 'shoulders', 'chest', 'pants'].includes(slotType)) {
        return `/static/Ico/Stones/gem_left_side_lvl_${level}.svg`;
    } else {
        return `/static/Ico/Stones/gem_right_side_lvl_${level}.svg`;
    }
}

function getSlotIcon(slotType) {
    return EquipmentConfig.buttonIcons[slotType] || '11_Lhand.svg';
}

function getSlotName(slotType) {
    return EquipmentConfig.slotNames[slotType] || 'Слот';
}