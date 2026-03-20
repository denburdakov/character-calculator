// stat_calculator.js
class StatCalculator {
    constructor() {
        this.baseStats = window.characterStats || {};
        this.currentClass = 'warrior';
        
        // Текущие модификаторы
        this.talentPoints = {};
        this.selectedTalents = {};
        this.talentAuras = {};
        this.elixirStats = {
            offensive: 'none',
            defensive: 'none'
        };
        this.guildBuff = false;
        
        // Бонусы от экипировки (будут добавляться из equipment)
        this.equipmentBonuses = {
            flat: {},      // Плоские бонусы (числа)
            percent: {}    // Процентные бонусы
        };
        
        // Дополнительные бонусы (для будущих расширений)
        this.extraBonuses = {
            flat: {},      // Плоские бонусы (числа)
            percent: {}    // Процентные бонусы
        };
        
        // Хранилище данных экипировки
        this.equipmentStats = {};
        this.stoneStats = {};
        
        // Кэш для хранения результатов расчетов
        this.cache = {
            base: {},
            equipment: {},
            stones: {},
            talents: {},
            elixirs: {},
            guild: {},
            total: {}
        };
        
        // Инициализация
        this.init();
    }
    
    init() {
        console.log('StatCalculator инициализирован');
        this.loadFromLocalStorage();
    }
    
    // Загрузка сохраненных данных
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('statCalculator');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentClass = data.currentClass || 'warrior';
                this.elixirStats = data.elixirStats || { offensive: 'none', defensive: 'none' };
                this.guildBuff = data.guildBuff || false;
            }
        } catch (e) {
            console.warn('Не удалось загрузить данные из localStorage', e);
        }
    }
    
    // Сохранение данных
    saveToLocalStorage() {
        try {
            const data = {
                currentClass: this.currentClass,
                elixirStats: this.elixirStats,
                guildBuff: this.guildBuff
            };
            localStorage.setItem('statCalculator', JSON.stringify(data));
        } catch (e) {
            console.warn('Не удалось сохранить данные в localStorage', e);
        }
    }
    
    // Установка текущего класса
    setClass(className) {
        if (this.baseStats[className]) {
            this.currentClass = className;
            this.clearCache();
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // Установка очков талантов (из talent_system.js)
    setTalentPoints(className, points) {
        this.talentPoints[className] = { ...points };
        this.clearCache();
    }
    
    // Установка выбранных талантов (из talent_system.js)
    setSelectedTalents(className, talents) {
        this.selectedTalents[className] = { ...talents };
        this.clearCache();
    }
    
    // Установка аур от талантов (из talent_system.js)
    setTalentAuras(auras) {
        this.talentAuras = { ...auras };
        this.clearCache();
    }
    
    // Установка эликсиров
    setElixirs(offensive, defensive) {
        this.elixirStats = {
            offensive: offensive || 'none',
            defensive: defensive || 'none'
        };
        this.clearCache();
        this.saveToLocalStorage();
    }
    
    // Установка гильдбаффа
    setGuildBuff(enabled) {
        this.guildBuff = enabled;
        this.clearCache();
        this.saveToLocalStorage();
    }
    
    // Очистка кэша
    clearCache() {
        this.cache = {
            base: {},
            equipment: {},
            stones: {},
            talents: {},
            elixirs: {},
            guild: {},
            total: {}
        };
    }
    
    // Получение базовых статов класса
    getBaseStats() {
        const className = this.currentClass;
        if (this.cache.base[className]) {
            return this.cache.base[className];
        }
        
        const stats = this.baseStats[className];
        if (!stats) {
            console.error(`Класс ${className} не найден в базе`);
            return {};
        }
        
        // Создаем копию базовых статов
        this.cache.base[className] = { ...stats };
        return this.cache.base[className];
    }
    
    // Получение множителя рун для слота
    getRuneMultiplier(slotType, runeLevel) {
        // Если нет рун или нет калькулятора
        if (runeLevel === 0 || runeLevel === '0' || !runeLevel || !window.runeCalculator) {
            return 0;
        }
        
        // Преобразуем в число
        const level = parseInt(runeLevel, 10);
        
        // Проверяем корректность уровня
        if (isNaN(level) || level < 1 || level > 12) {
            console.warn(`Некорректный уровень рун: ${runeLevel}`);
            return 0;
        }
        
        const runeBonuses = window.runeCalculator.runeBonuses;
        const runeData = runeBonuses[level];
        
        if (!runeData) {
            console.error(`❌ ОШИБКА: Данные для уровня рун ${level} не найдены!`);
            return 0;
        }
        
        // Определяем тип слота
        const equipmentSlots = window.runeCalculator.equipmentSlots || 
            ['chest', 'helm', 'shoulders', 'pants', 'boots', 'hands', 'bracers', 'belt', 'cape'];
        const jewelrySlots = window.runeCalculator.jewelrySlots || 
            ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        const weaponSlots = window.runeCalculator.weaponSlots || ['rhand', 'lhand'];
        
        let multiplier = 0;
        
        if (equipmentSlots.includes(slotType)) {
            multiplier = runeData.equipment || 0;
        } else if (jewelrySlots.includes(slotType)) {
            multiplier = runeData.jewelry || 0;
        } else if (weaponSlots.includes(slotType)) {
            multiplier = runeData.weapon || 0;
        }
        
        return multiplier;
    }
    
    // Получение базовых значений для слота
    getBaseValuesForSlot(slotType, equipment) {
        const result = { armour: 0, spell_armour: 0, block: 0 };
        
        if (!window.armorCalculator) return result;
        
        const currentClass = this.currentClass;
        const armorCalc = window.armorCalculator;
        
        // 1. Базовая броня для обычной экипировки
        if (armorCalc.baseArmorValues[currentClass] && 
            armorCalc.baseArmorValues[currentClass][slotType]) {
            const base = armorCalc.baseArmorValues[currentClass][slotType];
            result.armour = base.armour || 0;
            result.spell_armour = base.spell_armour || 0;
            result.block = base.block || 0;
        }
        
        // 2. Для плаща
        if (slotType === 'cape' && equipment?.quality) {
            const quality = equipment.quality;
            if (armorCalc.capeBaseArmorValues[quality]) {
                const cape = armorCalc.capeBaseArmorValues[quality];
                result.armour = cape.armour || 0;
                result.spell_armour = cape.spell_armour || 0;
            }
        }
        
        // 3. Для щита
        if (slotType === 'lhand' && equipment?.leftHandType === 'shield') {
            if (armorCalc.baseArmorValues[currentClass] && 
                armorCalc.baseArmorValues[currentClass]['shield']) {
                const shieldBase = armorCalc.baseArmorValues[currentClass]['shield'];
                result.block = shieldBase.block || 0;
            }
        }
        
        return result;
    }
    
    // Расчет бонусов от экипировки и рун
    calculateEquipmentBonuses() {
        const cacheKey = `${this.currentClass}_${JSON.stringify(this.equipmentStats)}`;
        
        if (this.cache.equipment[cacheKey]) {
            return this.cache.equipment[cacheKey];
        }
        
        const flatBonuses = {};
        const percentBonuses = {};
        
        // Проходим по всем слотам с экипировкой
        Object.entries(this.equipmentStats).forEach(([slotType, equipment]) => {
            if (!equipment || !equipment.stats) return;
            
            // Получаем базовые значения для слота
            const baseValues = this.getBaseValuesForSlot(slotType, equipment);
            
            // Объединяем базовые значения и статы из XML
            const allStats = { ...baseValues };
            
            // Добавляем бонусные статы из XML
            if (equipment.stats) {
                Object.entries(equipment.stats).forEach(([stat, value]) => {
                    allStats[stat] = (allStats[stat] || 0) + value;
                });
            }
            
            // Получаем множитель рун
            const runeLevel = parseInt(equipment.runeLevel || 0, 10);
            const runeMultiplier = this.getRuneMultiplier(slotType, runeLevel);
            
            // Проверяем, является ли слот бижутерией
            const jewelrySlots = window.runeCalculator?.jewelrySlots || 
                ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
            const isJewelry = jewelrySlots.includes(slotType);
            
            // Применяем руны к каждому стату
            Object.entries(allStats).forEach(([stat, value]) => {
                if (stat.includes('_percent')) {
                    // Процентные статы
                    const baseStat = stat.replace('_percent', '');
                    percentBonuses[baseStat] = (percentBonuses[baseStat] || 0) + (value / 100);
                } else {
                    // Плоские статы
                    let finalValue = value;
                    
                    // Применяем множитель рун для ВСЕХ типов слотов (включая бижутерию)
                    if (runeMultiplier > 0) {
                        // Для бижутерии используем специальную логику или общий множитель?
                        if (isJewelry) {
                            // Вариант 1: Используем специальные бонусы из armor_calculator
                            if (window.armorCalculator?.jewelryRuneBonuses?.[runeLevel]) {
                                const jewelryBonus = window.armorCalculator.jewelryRuneBonuses[runeLevel];
                                
                                // Для специальных статов (armour, spell_armour) используем специальные бонусы
                                if (stat === 'armour' && jewelryBonus.armour) {
                                    finalValue = value + jewelryBonus.armour;
                                } else if (stat === 'spell_armour' && jewelryBonus.spell_armour) {
                                    finalValue = value + jewelryBonus.spell_armour;
                                } else {
                                    // Для остальных статов используем общий множитель
                                    const runeBonus = Math.round(value * runeMultiplier);
                                    finalValue = value + runeBonus;
                                }
                            } else {
                                // Если нет специальных бонусов, используем общий множитель
                                const runeBonus = Math.round(value * runeMultiplier);
                                finalValue = value + runeBonus;
                            }
                        } else {
                            // Для обычной экипировки и оружия
                            const runeBonus = Math.round(value * runeMultiplier);
                            finalValue = value + runeBonus;
                        }
                        
                        console.log(`🔧 Рунный расчет для ${slotType}.${stat}:`, {
                            baseValue: value,
                            runeMultiplier: runeMultiplier,
                            runeBonus: finalValue - value,
                            totalValue: finalValue,
                            isJewelry: isJewelry
                        });
                    }
                    
                    flatBonuses[stat] = (flatBonuses[stat] || 0) + finalValue;
                }
            });
        });
        
        const result = { flat: flatBonuses, percent: percentBonuses };
        this.cache.equipment[cacheKey] = result;
        return result;
    }
    
    calculateStonesBonus() {
        const cacheKey = `${this.currentClass}_${JSON.stringify(this.equipmentStats)}`;
        
        if (this.cache.stones[cacheKey]) {
            return this.cache.stones[cacheKey];
        }
        
        const flatBonuses = {};
        const percentBonuses = {}; // Для процентных камней, если понадобятся отдельно

        // Проходим по всем слотам с экипировкой
        Object.entries(this.equipmentStats).forEach(([slotType, equipment]) => {
            if (!equipment || !equipment.stones || equipment.stones.length === 0) return;

            // Получаем калькулятор камней
            const stoneCalc = window.stoneCalculator;
            if (!stoneCalc) return;

            // Проходим по всем камням в слоте
            equipment.stones.forEach(stone => {
                const stoneId = stone.id;
                const stoneLevel = stone.level;
                const stoneData = stoneCalc.stoneBonuses[stoneId];

                if (!stoneData) {
                    console.warn(`Данные для камня ${stoneId} не найдены`);
                    return;
                }

                // Получаем значение для данного уровня камня
                const value = stoneData.values[stoneLevel - 1];
                
                if (stoneData.type === 'absolute') {
                    // Для абсолютных камней добавляем как плоский бонус
                    flatBonuses[stoneId] = (flatBonuses[stoneId] || 0) + value;
                } else if (stoneData.type === 'percent') {
                    // Для процентных камней пока просто логируем, они будут обработаны отдельно
                    percentBonuses[stoneId] = (percentBonuses[stoneId] || 0) + value;
                }
            });
        });

        const result = { flat: flatBonuses, percent: percentBonuses };
        this.cache.stones[cacheKey] = result;
        return result;
    }

    // Расчет бонусов от талантов
    calculateTalentsBonus() {
        const className = this.currentClass;
        const cacheKey = `${className}_${JSON.stringify(this.talentPoints[className])}_${JSON.stringify(this.selectedTalents[className])}`;
        
        if (this.cache.talents[cacheKey]) {
            return this.cache.talents[cacheKey];
        }
        
        const bonuses = {};
        const talentPoints = this.talentPoints[className] || {};
        const talentCalculator = window.talentCalculator;
        
        if (!talentCalculator) {
            return bonuses;
        }
        
        // Получаем конфигурацию талантов для класса
        const classTalents = talentCalculator.talentBonuses[className];
        if (!classTalents) {
            return bonuses;
        }
        
        // Для каждой ветки талантов
        Object.entries(classTalents).forEach(([branchName, branchConfig]) => {
            const points = talentPoints[branchName] || 0;
            if (points === 0) return;
            
            const branchStats = branchConfig.stats;
            
            // Добавляем бонусы от ветки (умножаем на количество очков)
            Object.entries(branchStats).forEach(([stat, percentPerPoint]) => {
                // ВАЖНО: Таланты дают ПРОЦЕНТНЫЙ бонус
                const totalPercent = (percentPerPoint * points) / 100;
                bonuses[stat] = (bonuses[stat] || 0) + totalPercent;
            });
        });
        
        // Добавляем бонусы от аур талантов
        Object.entries(this.talentAuras).forEach(([stat, value]) => {
            if (stat.includes('_percent')) {
                // Процентные ауры
                const baseStat = stat.replace('_percent', '');
                bonuses[baseStat] = (bonuses[baseStat] || 0) + (value / 100);
            } else {
                // Плоские ауры - они будут добавлены отдельно
                bonuses[`flat_${stat}`] = (bonuses[`flat_${stat}`] || 0) + value;
            }
        });
        
        this.cache.talents[cacheKey] = bonuses;
        return bonuses;
    }
    
    // Расчет бонусов от эликсиров
    calculateElixirsBonus() {
        const cacheKey = `${this.elixirStats.offensive}_${this.elixirStats.defensive}`;
        
        if (this.cache.elixirs[cacheKey]) {
            return this.cache.elixirs[cacheKey];
        }
        
        const bonuses = {};
        const elixirCalculator = window.elixirCalculator;
        
        if (!elixirCalculator) {
            return bonuses;
        }
        
        // Получаем бонусы от атакующего эликсира
        const offensiveElixir = elixirCalculator.elixirBonuses[this.elixirStats.offensive];
        if (offensiveElixir && offensiveElixir.stats) {
            Object.entries(offensiveElixir.stats).forEach(([stat, percent]) => {
                bonuses[stat] = (bonuses[stat] || 0) + (percent / 100);
            });
        }
        
        // Получаем бонусы от защитного эликсира
        const defensiveElixir = elixirCalculator.elixirBonuses[this.elixirStats.defensive];
        if (defensiveElixir && defensiveElixir.stats) {
            Object.entries(defensiveElixir.stats).forEach(([stat, percent]) => {
                bonuses[stat] = (bonuses[stat] || 0) + (percent / 100);
            });
        }
        
        this.cache.elixirs[cacheKey] = bonuses;
        return bonuses;
    }
    
    // Расчет бонусов от гильдбаффа
    calculateGuildBuffBonus() {
        if (!this.guildBuff) {
            return {};
        }
        
        if (this.cache.guild.enabled) {
            return this.cache.guild.bonuses;
        }
        
        const bonuses = {
            all_stats: 0.03,  // +3% ко всем характеристикам
            hp: 0.05,         // +5% к здоровью
            crit_damage_resistance: 0.05  // +5% к сопротивлению крит. урону
        };
        
        this.cache.guild = {
            enabled: true,
            bonuses: bonuses
        };
        
        return bonuses;
    }
    
    // Расчет итоговых статистик
    calculateTotalStats() {
        const cacheKey = `${this.currentClass}_${this.guildBuff}_${JSON.stringify(this.elixirStats)}_${JSON.stringify(this.talentPoints[this.currentClass])}_${JSON.stringify(this.equipmentStats)}`;
        
        if (this.cache.total[cacheKey]) {
            return this.cache.total[cacheKey];
        }
        
        // Получаем базовые статы
        const baseStats = this.getBaseStats();
        
        // Получаем бонусы от экипировки (с учетом рун)
        const equipmentBonuses = this.calculateEquipmentBonuses();
        
        // Получаем бонусы от камней (только абсолютные)
        const stonesBonuses = this.calculateStonesBonus();
        
        // Получаем бонусы от талантов
        const talentsBonuses = this.calculateTalentsBonus();
        
        // Получаем бонусы от эликсиров
        const elixirsBonuses = this.calculateElixirsBonus();
        
        // Получаем бонусы от гильдбаффа
        const guildBonuses = this.calculateGuildBuffBonus();
        
        // ИСПРАВЛЕНИЕ: Правильный порядок расчета
        // 1. Начинаем с базовых значений
        let result = { ...baseStats };
        
        // 2. СОХРАНЯЕМ ОТДЕЛЬНО ЗНАЧЕНИЯ, КОТОРЫЕ НЕ ДОЛЖНЫ ПОПАДАТЬ ПОД ПРОЦЕНТЫ
        //    Это значения от АБСОЛЮТНЫХ камней
        const nonScalableValues = { ...stonesBonuses.flat };
        
        // 3. Добавляем плоские бонусы от экипировки (ЭТО ЭКИПИРОВКА)
        Object.entries(equipmentBonuses.flat).forEach(([stat, value]) => {
            if (result[stat] !== undefined) {
                result[stat] += value;
            } else {
                result[stat] = value;
            }
        });
        
        // 4. Добавляем плоские бонусы от талантов (ауры)
        Object.entries(talentsBonuses).forEach(([stat, value]) => {
            if (stat.startsWith('flat_')) {
                const baseStat = stat.replace('flat_', '');
                if (result[baseStat] !== undefined) {
                    result[baseStat] += value;
                }
            }
        });
        
        // 5. ПРИМЕНЯЕМ ПРОЦЕНТНЫЕ БОНУСЫ К ТЕКУЩЕЙ СУММЕ (НО НЕ К ЗНАЧЕНИЯМ ОТ КАМНЕЙ)
        // Собираем все процентные бонусы
        const percentBonuses = { ...talentsBonuses };
        
        // Удаляем плоские бонусы из percentBonuses
        Object.keys(percentBonuses).forEach(key => {
            if (key.startsWith('flat_')) {
                delete percentBonuses[key];
            }
        });
        
        // Добавляем процентные бонусы от эликсиров
        Object.entries(elixirsBonuses).forEach(([stat, value]) => {
            percentBonuses[stat] = (percentBonuses[stat] || 0) + value;
        });
        
        // Добавляем процентные бонусы от экипировки
        Object.entries(equipmentBonuses.percent).forEach(([stat, value]) => {
            percentBonuses[stat] = (percentBonuses[stat] || 0) + value;
        });

        // Добавляем специальные бонусы гильдбаффа
        if (guildBonuses.hp && result.hp !== undefined) {
            percentBonuses.hp = (percentBonuses.hp || 0) + guildBonuses.hp - (guildBonuses.all_stats || 0);
        }
        
        if (guildBonuses.crit_damage_resistance && result.crit_damage_resistance !== undefined) {
            percentBonuses.crit_damage_resistance = (percentBonuses.crit_damage_resistance || 0) + 
                guildBonuses.crit_damage_resistance - (guildBonuses.all_stats || 0);
        }
        
        // ВАЖНО: Сначала применяем процентные бонусы к scalabledValue (база + экипировка + таланты)
        // Затем добавляем non-scalable значения (камни) уже после процентов
        Object.entries(percentBonuses).forEach(([stat, percent]) => {
            if (result[stat] !== undefined && percent !== 0) {
                // Пропускаем гильдбафф (он будет применен отдельно)
                if (stat === 'all_stats') return;
                const bonus = Math.floor(result[stat] * percent);
                result[stat] += bonus;
            }
        });

        // 6. Применяем гильдбафф отдельно (как мультипликативный бонус)
        if (guildBonuses.all_stats) {
            Object.keys(result).forEach(stat => {
                if (typeof result[stat] === 'number') {
                    const guildBonus = Math.floor(result[stat] * guildBonuses.all_stats);
                    result[stat] += guildBonus;
                }
            });
        }
        
        // 7. ТЕПЕРЬ добавляем значения от АБСОЛЮТНЫХ КАМНЕЙ (они не должны были умножаться на проценты)
        Object.entries(nonScalableValues).forEach(([stat, value]) => {
            if (result[stat] !== undefined) {
                result[stat] += value;
            } else {
                result[stat] = value;
            }
        });
        
        // 8. Применяем бонусы от ПРОЦЕНТНЫХ камней (для оружия)
        // Процентные камни должны применяться к итоговому значению ПОСЛЕ добавления абсолютных камней
        Object.entries(this.equipmentStats).forEach(([slotType, equipment]) => {
            if (!equipment || !equipment.stones || equipment.stones.length === 0) return;

            const stoneCalc = window.stoneCalculator;
            if (!stoneCalc) return;

            equipment.stones.forEach(stone => {
                const stoneId = stone.id;
                const stoneLevel = stone.level;
                const stoneData = stoneCalc.stoneBonuses[stoneId];

                if (stoneData && stoneData.type === 'percent' && stoneData.values) {
                    const percentValue = stoneData.values[stoneLevel - 1] / 100;
                    
                    // Применяем процент к соответствующей характеристике
                    // Камень `hp_percent` применяется к `hp`
                    const targetStat = stoneId.replace('_percent', '');
                    
                    if (result[targetStat] !== undefined) {
                        const bonus = Math.floor(result[targetStat] * percentValue);
                        result[targetStat] += bonus;
                    }
                }
            });
        });
        
        // Округляем все значения вниз
        Object.keys(result).forEach(stat => {
            if (typeof result[stat] === 'number') {
                result[stat] = Math.floor(result[stat]);
            }
        });
        
        this.cache.total[cacheKey] = result;
        return result;
    }
    
    // Получение детальной разбивки статистики
    getStatBreakdown(statName) {
        const baseStats = this.getBaseStats();
        const baseValue = baseStats[statName] || 0;
        
        const breakdown = {
            base: baseValue,
            equipment: 0,
            stones: 0,        // Значения от камней (не масштабируемые)
            talents: 0,
            elixirs: 0,
            guild: 0,
            total: baseValue
        };
        
        // Получаем все бонусы
        const equipmentBonuses = this.calculateEquipmentBonuses();
        const stonesBonuses = this.calculateStonesBonus();
        const talentsBonuses = this.calculateTalentsBonus();
        const elixirsBonuses = this.calculateElixirsBonus();
        const guildBonuses = this.calculateGuildBuffBonus();
        
        // 1. БАЗА + ЭКИПИРОВКА + ТАЛАНТЫ (плоские)
        let scalableValue = baseValue;
        
        // Добавляем плоские бонусы от экипировки
        if (equipmentBonuses.flat[statName]) {
            breakdown.equipment += equipmentBonuses.flat[statName];
            scalableValue += equipmentBonuses.flat[statName];
        }
        
        // Добавляем плоские бонусы от талантов
        if (talentsBonuses[`flat_${statName}`]) {
            breakdown.talents += talentsBonuses[`flat_${statName}`];
            scalableValue += talentsBonuses[`flat_${statName}`];
        }
        
        // 2. ПРИМЕНЯЕМ ПРОЦЕНТНЫЕ БОНУСЫ К scalableValue
        let totalPercent = 0;
        
        // Процентные бонусы от талантов
        if (talentsBonuses[statName]) {
            totalPercent += talentsBonuses[statName];
        }
        
        // Процентные бонусы от эликсиров
        if (elixirsBonuses[statName]) {
            totalPercent += elixirsBonuses[statName];
        }
        
        // Процентные бонусы от экипировки
        if (equipmentBonuses.percent[statName]) {
            totalPercent += equipmentBonuses.percent[statName];
        }
        
        // Процентные бонусы от гильдбаффа
        if (guildBonuses.all_stats) {
            totalPercent += guildBonuses.all_stats;
        }
        
        // Специальные бонусы гильдбаффа
        if (statName === 'hp' && guildBonuses.hp) {
            totalPercent += guildBonuses.hp - (guildBonuses.all_stats || 0);
        }
        
        if (statName === 'crit_damage_resistance' && guildBonuses.crit_damage_resistance) {
            totalPercent += guildBonuses.crit_damage_resistance - (guildBonuses.all_stats || 0);
        }
        
        // Применяем проценты
        let percentBonus = 0;
        if (totalPercent > 0) {
            percentBonus = Math.floor(scalableValue * totalPercent);
            breakdown.guild += percentBonus; // Пока так
            scalableValue += percentBonus;
        }
        
        // 3. ТЕПЕРЬ ДОБАВЛЯЕМ ЗНАЧЕНИЯ ОТ АБСОЛЮТНЫХ КАМНЕЙ (они не масштабируются)
        if (stonesBonuses.flat[statName]) {
            breakdown.stones += stonesBonuses.flat[statName];
        }
        
        // 4. ИТОГ: scalableValue (с процентами) + абсолютные камни
        breakdown.total = Math.floor(scalableValue + (stonesBonuses.flat[statName] || 0));
        
        // 5. Учитываем процентные камни (оружие) - это сложно для разбивки, но итоговая сумма корректна
        
        return breakdown;
    }
    
    // Установка экипировки в слот
    setEquipment(slotType, equipmentData) {
        this.equipmentStats[slotType] = equipmentData;
        this.clearCache();
        
        console.log(`✅ Экипировка установлена в слот ${slotType}:`, equipmentData);
        
        // Обновляем отображение
        if (typeof window.updateStatsDisplay === 'function') {
            window.updateStatsDisplay();
        }
    }
    
    // Удаление экипировки из слота
    removeEquipment(slotType) {
        if (this.equipmentStats && this.equipmentStats[slotType]) {
            delete this.equipmentStats[slotType];
            this.clearCache();
            
            console.log(`❌ Экипировка удалена из слота ${slotType}`);
            
            // Обновляем отображение
            if (typeof window.updateStatsDisplay === 'function') {
                window.updateStatsDisplay();
            }
        }
    }
    
    // Получение всех статов для отображения
    getAllStats() {
        return this.calculateTotalStats();
    }
    
    // Экспорт данных
    exportData() {
        return {
            currentClass: this.currentClass,
            talentPoints: this.talentPoints[this.currentClass],
            selectedTalents: this.selectedTalents[this.currentClass],
            elixirStats: this.elixirStats,
            guildBuff: this.guildBuff,
            equipmentStats: this.equipmentStats,
            stats: this.calculateTotalStats()
        };
    }
    
    updateStats() {
        this.clearCache();
        
        // Обновляем отображение если функция доступна
        if (typeof window.updateStatsDisplay === 'function') {
            window.updateStatsDisplay();
        }
        
        return this.calculateTotalStats();
    }
}

// Создаем глобальный экземпляр
window.statCalculator = new StatCalculator();

// Функция для обновления отображения статистик на странице
function updateStatsDisplay(stats) {
    if (!stats) {
        stats = window.statCalculator.getAllStats();
    }
    
    // Обновляем все поля статистик
    const statElements = {
        'attack_power': 'attack_power',
        'attack_speed': 'attack_speed',
        'hit': 'hit',
        'crit': 'crit',
        'parry': 'parry',
        'dodge': 'dodge',
        'resist': 'resist',
        'block': 'block',
        'spell_armour': 'spell_armour',
        'armour': 'armour',
        'mp_reg': 'mp_reg',
        'hp_reg': 'hp_reg',
        'mp': 'mp',
        'hp': 'hp',
        'crit_damage_resistance': 'crit_damage_resistance',
        'speed': 'speed'
    };
    
    Object.entries(statElements).forEach(([stat, elementId]) => {
        const element = document.getElementById(elementId);
        if (element && stats[stat] !== undefined) {
            element.textContent = stats[stat];
        }
    });
    
    console.log('Статистики обновлены:', stats);
}

// Делаем функцию глобальной
window.updateStatsDisplay = updateStatsDisplay;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для эликсиров
    const offensiveRadios = document.querySelectorAll('input[name="offensive-elixir"]');
    const defensiveRadios = document.querySelectorAll('input[name="defensive-elixir"]');
    const guildBuffCheckbox = document.getElementById('guild-buff');
    
    if (offensiveRadios.length) {
        offensiveRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    window.statCalculator.setElixirs(this.value, 
                        document.querySelector('input[name="defensive-elixir"]:checked')?.value || 'none');
                    updateStatsDisplay();
                }
            });
        });
    }
    
    if (defensiveRadios.length) {
        defensiveRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    window.statCalculator.setElixirs(
                        document.querySelector('input[name="offensive-elixir"]:checked')?.value || 'none',
                        this.value
                    );
                    updateStatsDisplay();
                }
            });
        });
    }
    
    if (guildBuffCheckbox) {
        guildBuffCheckbox.addEventListener('change', function() {
            window.statCalculator.setGuildBuff(this.checked);
            updateStatsDisplay();
        });
    }
    
    // Обработчики для кнопок классов
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const className = this.getAttribute('data-class');
            if (className && className !== 'reset') {
                window.statCalculator.setClass(className);
                updateStatsDisplay();
            }
        });
    });
    
    // Первоначальное обновление
    setTimeout(() => {
        updateStatsDisplay();
    }, 100);
});