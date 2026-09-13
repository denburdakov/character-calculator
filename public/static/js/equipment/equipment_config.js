// equipment_config.js
// Конфигурация путей к иконкам и файлам данных

const EquipmentConfig = {
    // Пути к иконкам классов
    classFolders: {
        'warrior': 'Warrior',
        'rogue': 'Rogue', 
        'priest': 'Priest',
        'archer': 'Archer',
        'mage': 'Mage'
    },
    
    // Иконки слотов обычной экипировки
    slotIcons: {
        'chest': 'Chest',
        'helm': 'Helmet',
        'shoulders': 'Shoulders',
        'pants': 'Pants',
        'boots': 'Boots',
        'hands': 'Gloves',
        'belt': 'Belt',
        'bracers': 'Bracers',
        'cape': 'Cape'
    },
    
    // Иконки кнопок слотов
    buttonIcons: {
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
    },
    
    // Названия слотов
    slotNames: {
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
    },
    
    // Файлы данных для слотов
    dataFiles: {
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
        'shield': 'Щит.xml'
    },
    
    // Маппинг характеристик для калькулятора
    statMapping: {
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
    },
    
    // Названия классов на русском
    classNames: {
        'warrior': 'Воин',
        'priest': 'Жрец', 
        'mage': 'Маг',
        'archer': 'Лучник',
        'rogue': 'Разбойник'
    },
    
    // Названия типов оружия
    weaponTypeNames: {
        'one-handed': 'Одноручное',
        'two-handed': 'Двуручное'
    },
    
    // Названия качества
    qualityNames: {
        'purple': 'Фиолетовый',
        'orange': 'Оранжевый',
        'red': 'Красный'
    },
    
    // Доступные типы оружия по классам
    weaponTypesByClass: {
        'warrior': ['one-handed', 'two-handed'],
        'priest': ['one-handed', 'two-handed'],  
        'mage': ['two-handed'],
        'archer': ['two-handed'],
        'rogue': ['one-handed']
    },
    
    // Классы, которые могут использовать щит
    shieldClasses: ['warrior', 'priest'],
    
    // Классы, которые могут использовать два оружия
    dualWieldClasses: ['rogue', 'warrior', 'priest'],
    
    // Оружие для разных классов (для рандомных иконок)
    weaponIcons: {
        'rogue': ['Dagger', '1HSword', '1HAxe'],
        'mage': ['Staff_fire', 'Staff_ice', 'Staff_lightning'],
        'warrior': {
            'two-handed': ['2HSword', '2HAxe'],
            'one-handed': ['1HSword', '1HAxe']
        },
        'priest': {
            'two-handed': ['2HMace'],
            'one-handed': ['1HMace']
        },
        'archer': ['Bow', 'XBow']
    },
    
    // Список слотов бижутерии
    jewelrySlots: ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'],
    
    // Список слотов без камней
    skipStonesSlots: ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2', 'cape'],
    
    // Список слотов оружия
    weaponSlots: ['rhand', 'lhand', 'rlhand']
};

// ============ Описание камней ============

// Камни Силы (абсолютные) — на всю экипировку кроме оружия
const StonesData = {
    // Камни Силы (absolute) — идут на экипировку
    strength: [
        { id: 'hp',                     name: 'Здоровье',                  color: '#ff6b6b' },
        { id: 'mp',                     name: 'Энергия',                   color: '#4ecdc4' },
        { id: 'hp_reg',                 name: 'Восст. Здоровья',           color: '#fd79a8' },
        { id: 'mp_reg',                 name: 'Восст. Энергии',            color: '#81ecec' },
        { id: 'attack_power',           name: 'Сила атаки',                color: '#45b7d1' },
        { id: 'armour',                 name: 'Физ. броня',                color: '#ff9f43' },
        { id: 'spell_armour',           name: 'Маг. Броня',                color: '#ee5253' },
        { id: 'hit',                    name: 'Точность',                  color: '#feca57' },
        { id: 'crit',                   name: 'Крит. Урон',                color: '#00d2d3' },
        { id: 'attack_speed',           name: 'Скорость атаки',            color: '#96ceb4' },
        { id: 'dodge',                  name: 'Уклонение',                 color: '#ff9ff3' },
        { id: 'parry',                  name: 'Парирование',               color: '#54a0ff' },
        { id: 'resist',                 name: 'Сопр. магии',               color: '#5f27cd' },
        { id: 'block',                  name: 'Блок',                      color: '#a29bfe' },
        { id: 'crit_damage_resistance', name: 'Сопр. Крит',                color: '#049c76' }
    ],

    // Камни Концентрации (процент) — идут на экипировку
    // При выборе камня пользователь указывает, на какую характеристику он влияет
    concentration: [
        { id: 'concentration', name: 'Концентрация (+%)', color: '#9b59b6' }
    ],

    // Оружейные камни (процент) — только для оружия/щита
    weapon: [
        { id: 'hp_percent',                     name: 'Здоровье %',         color: '#ff6b6b' },
        { id: 'mp_percent',                     name: 'Энергия %',          color: '#4ecdc4' },
        { id: 'attack_power_percent',           name: 'Сила атаки %',       color: '#45b7d1' },
        { id: 'attack_speed_percent',           name: 'Скорость атаки %',   color: '#96ceb4' },
        { id: 'hit_percent',                    name: 'Точность %',         color: '#feca57' },
        { id: 'dodge_percent',                  name: 'Уклонение %',        color: '#ff9ff3' },
        { id: 'parry_percent',                  name: 'Парирование %',      color: '#54a0ff' },
        { id: 'resist_percent',                 name: 'Сопр. магии %',      color: '#5f27cd' },
        { id: 'crit_percent',                   name: 'Крит. Урон %',       color: '#00d2d3' },
        { id: 'armour_percent',                 name: 'Физ. броня %',       color: '#ff9f43' },
        { id: 'spell_armour_percent',           name: 'Маг. Броня %',       color: '#ee5253' },
        { id: 'block_percent',                  name: 'Блок %',             color: '#a29bfe' },
        { id: 'hp_reg_percent',                 name: 'Восст. Здоровья %',  color: '#fd79a8' },
        { id: 'mp_reg_percent',                 name: 'Восст. Энергии %',   color: '#81ecec' },
        { id: 'crit_damage_resistance_percent', name: 'Сопр. Крит %',       color: '#049c76' }
    ]
};

// Значения камней (синхронизировано со stone_calculator.js)
const stoneBonuses = {
    strength: {
        'hp':                     { values: [232, 310, 425, 580, 775, 1005, 1275, 1585, 1935, 2320], type: 'absolute' },
        'mp':                     { values: [140, 185, 255, 350, 465, 605, 765, 950, 1160, 1392],     type: 'absolute' },
        'hp_reg':                 { values: [54, 70, 95, 130, 175, 230, 295, 370, 450, 534],         type: 'absolute' },
        'mp_reg':                 { values: [18, 24, 34, 46, 62, 81, 103, 128, 157, 188],             type: 'absolute' },
        'attack_power':           { values: [42, 55, 75, 105, 140, 180, 230, 285, 350, 418],          type: 'absolute' },
        'armour':                 { values: [498, 665, 915, 1245, 1660, 2160, 2740, 3405, 4155, 4986], type: 'absolute' },
        'spell_armour':           { values: [498, 665, 915, 1245, 1660, 2160, 2740, 3405, 4155, 4986], type: 'absolute' },
        'hit':                    { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],          type: 'absolute' },
        'crit':                   { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],          type: 'absolute' },
        'attack_speed':           { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],          type: 'absolute' },
        'crit_damage_resistance': { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],          type: 'absolute' },
        'dodge':                  { values: [120, 160, 220, 300, 400, 520, 665, 825, 1005, 1206],     type: 'absolute' },
        'parry':                  { values: [120, 160, 220, 300, 400, 520, 665, 825, 1005, 1206],     type: 'absolute' },
        'resist':                 { values: [120, 160, 220, 300, 400, 520, 665, 825, 1005, 1206],     type: 'absolute' },
        'block':                  { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],          type: 'absolute' }
    },

    concentration: {
        // У камня один общий процент; конкретная характеристика задаётся пользователем
        'concentration': { values: [0.50, 0.67, 0.92, 1.25, 1.67, 2.17, 2.75, 3.42, 4.17, 5.00], type: 'concentration' }
    },

    weapon: {
        'hp_percent':                     { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'mp_percent':                     { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'attack_power_percent':           { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'attack_speed_percent':           { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'hit_percent':                    { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'dodge_percent':                  { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'parry_percent':                  { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'resist_percent':                 { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'crit_percent':                   { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'armour_percent':                 { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'spell_armour_percent':           { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'block_percent':                  { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'hp_reg_percent':                 { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'mp_reg_percent':                 { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
        'crit_damage_resistance_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' }
    }
};