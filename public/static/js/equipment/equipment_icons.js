// equipment_icons.js
// Функции для получения путей к иконкам экипировки

// Конфигурация для иконок и названий слотов
const EquipmentIconsConfig = {
    // Маппинг названий слотов для отображения
    slotNames: {
        'helm': 'Голова',
        'shoulders': 'Плечи',
        'chest': 'Роба',
        'ring1': 'Кольцо 1',
        'trinket1': 'Амулет 1',
        'neck': 'Ожерелье',
        'pants': 'Штаны',
        'rhand': 'Оружие',
        'trinket2': 'Амулет 2',
        'hands': 'Перчатки',
        'boots': 'Сапоги',
        'lhand': 'Щит',
        'cape': 'Плащ',
        'bracers': 'Наручи',
        'belt': 'Пояс',
        'ring2': 'Кольцо 2'
    },
    
    // Маппинг слотов для иконок кнопок
    buttonIcons: {
        'helm': '01_Helm',
        'shoulders': '02_shoulders',
        'chest': '04_Chest',
        'ring1': '08_Ring1',
        'trinket1': '06_Trinket1',
        'neck': '09_Neck',
        'pants': '16_Pants',
        'rhand': '07_Rhand',
        'trinket2': '18_Trinket2',
        'hands': '14_Hands',
        'boots': '17_Boots',
        'lhand': '11_Lhand',
        'cape': '03_Cape',
        'bracers': '13_Bracers',
        'belt': '15_Belt',
        'ring2': '12_Ring2'
    },
    
    // Маппинг классов к папкам
    classFolders: {
        'warrior': 'Warrior',
        'rogue': 'Rogue',
        'mage': 'Mage',
        'priest': 'Priest',
        'archer': 'Archer'
    },
    
    // Иконки оружия для разных классов
    weaponIcons: {
        rogue: ['Dagger', 'Sword'],
        mage: ['Staff'],
        archer: ['Bow'],
        warrior: {
            'one-handed': ['Sword', 'Axe', 'Mace'],
            'two-handed': ['TwoHandedSword', 'TwoHandedAxe', 'TwoHandedMace']
        },
        priest: {
            'one-handed': ['Mace', 'Scepter'],
            'two-handed': ['Staff']
        }
    },
    
    // Маппинг типов слотов для иконок
    slotIcons: {
        'helm': 'Helm',
        'shoulders': 'Shoulders',
        'chest': 'Chest',
        'ring1': 'Ring',
        'trinket1': 'Trinket',
        'neck': 'Neck',
        'pants': 'Pants',
        'rhand': 'Weapon',
        'trinket2': 'Trinket',
        'hands': 'Gloves',
        'boots': 'Boots',
        'lhand': 'Shield',
        'cape': 'Cape',
        'bracers': 'Bracers',
        'belt': 'Belt',
        'ring2': 'Ring'
    }
};

// Функция для получения имени слота для отображения
function getSlotName(slotType) {
    return EquipmentIconsConfig.slotNames[slotType] || slotType;
}

// Функция для получения имени иконки слота
function getSlotIconName(slotType) {
    return EquipmentIconsConfig.buttonIcons[slotType] || '11_Lhand';
}

// Функция для получения пути к иконке экипировки
function getEquipmentIconPath(slotType, equipmentType, className) {
    const classFolder = EquipmentIconsConfig.classFolders[className] || 'Warrior';
    const slotIcon = EquipmentIconsConfig.slotIcons[slotType] || 'Chest';
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    return `/static/Ico/Classes/${classFolder}/${setType}/${slotIcon}.svg`;
}

// Функция для получения пути к иконке оружия
function getWeaponIconPath(weaponType, className, equipmentType) {
    const classFolder = EquipmentIconsConfig.classFolders[className] || 'Warrior';
    const weaponFolder = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    let weaponIcon = 'Weapon';
    const weaponIcons = EquipmentIconsConfig.weaponIcons;
    
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

// Функция для получения пути к иконке щита
function getShieldIconPath(className, equipmentType) {
    const classFolder = EquipmentIconsConfig.classFolders[className] || 'Warrior';
    const setType = equipmentType === '4-stat' ? 'Set_2' : 'Set_3';
    
    return `/static/Ico/Classes/${classFolder}/${setType}/Shield.svg`;
}

// Функция для получения пути к иконке украшения
function getJewelryIconPath(slotType, quality, equipmentType) {
    const qualityFolder = quality === 'orange' ? 'orange' : 'purple';
    const slotIcon = slotType === 'neck' ? 'Neck' : 
                    (slotType.startsWith('ring') ? 'Ring' : 'Trinket');
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

// Функция для получения пути к иконке камня
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

// Функция для получения иконки слота (для обратной совместимости)
function getSlotIcon(slotType) {
    return `${EquipmentIconsConfig.buttonIcons[slotType] || '11_Lhand'}.svg`;
}

// Экспортируем функции и конфигурацию в глобальную область
window.EquipmentIcons = {
    getSlotName,
    getSlotIconName,
    getEquipmentIconPath,
    getWeaponIconPath,
    getShieldIconPath,
    getJewelryIconPath,
    getCapeIconPath,
    getStoneIconPath,
    getSlotIcon,
    config: EquipmentIconsConfig
};