class StoneCalculator {
    constructor() {
        this.stoneStats = {};
        this.weaponStonePercentage = 0.07; // 7% для оружейных камней
        
        this.stoneBonuses = {
            // Обычные камни (абсолютные значения)
            'hp': { values: [580, 812, 1159, 1623, 2319], type: 'absolute' },
            'mp': { values: [348, 487, 696, 974, 1391], type: 'absolute' },
            'attack_power': { values: [104, 146, 209, 292, 417], type: 'absolute' },
            'attack_speed': { values: [116, 162, 232, 325, 464], type: 'absolute' },
            'hit': { values: [116, 162, 232, 325, 464], type: 'absolute' },
            'dodge': { values: [301, 422, 603, 844, 1206], type: 'absolute' },
            'parry': { values: [301, 422, 603, 844, 1206], type: 'absolute' },
            'resist': { values: [301, 422, 603, 844, 1206], type: 'absolute' },
            'crit': { values: [116, 162, 232, 325, 464], type: 'absolute' },
            'armour': { values: [1246, 1745, 2493, 3490, 4985], type: 'absolute' },
            'spell_armour': { values: [1246, 1745, 2493, 3490, 4985], type: 'absolute' },
            'block': { values: [116, 162, 232, 325, 464], type: 'absolute' },
            'hp_reg': { values: [133, 187, 267, 373, 533], type: 'absolute' },
            'mp_reg': { values: [47, 65, 93, 131, 187], type: 'absolute' },
            'crit_damage_resistance': { values: [116, 162, 232, 325, 464], type: 'absolute' },
            
            // Оружейные камни
            'hp_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'mp_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'attack_power_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'attack_speed_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'hit_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'dodge_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'parry_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'resist_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'crit_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'armour_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'spell_armour_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'block_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'hp_reg_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'mp_reg_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' },
            'crit_damage_resistance_percent': { values: [1.75, 2.45, 3.5, 4.9, 7.0], type: 'percent' }
        };
    }

    // Упрощенный метод применения бонусов
    applyStoneBonuses(stats) {
        const resultStats = { ...stats };
        const baseStats = this.getBaseStatsForPercentage(); // Получаем базовые статы для процентных расчетов

        Object.entries(this.stoneStats).forEach(([slotType, stones]) => {
            if (!Array.isArray(stones) || stones.length === 0) return;
                stones.forEach(stone => {
                    if (!stone || !stone.id) return;

                    const stoneValue = this.getStoneValue(stone.id, stone.level);
                    if (stoneValue === null || stoneValue === undefined) return;

                    const isPercentageStone = this.isPercentageStone(stone.id, slotType);
                    this.applySingleStoneBonus(resultStats, stone.id, stoneValue, isPercentageStone, baseStats);
                });
        });

        return resultStats;
    }

    // Получение базовых статистик для процентных расчетов
    getBaseStatsForPercentage() {
        const baseStats = {};
        
        // Получаем базовые статы класса
        if (window.statCalculator?.baseStats && window.statCalculator.currentClass) {
            Object.assign(baseStats, window.statCalculator.baseStats[window.statCalculator.currentClass] || {});
        }
        
        // Добавляем базовую броню от экипировки
        if (window.armorCalculator && window.equipmentData && window.statCalculator?.currentClass) {
            try {
                const baseArmor = window.armorCalculator.calculateBaseArmorWithRunes(
                    window.statCalculator.currentClass,
                    window.equipmentData,
                    window.statCalculator?.runeCalculator
                );
                
                if (baseArmor) {
                    baseStats.armour = (baseStats.armour || 0) + (baseArmor.armour || 0);
                    baseStats.spell_armour = (baseStats.spell_armour || 0) + (baseArmor.spell_armour || 0);
                    baseStats.block = (baseStats.block || 0) + (baseArmor.block || 0);
                }
            } catch (error) {
                console.error('Ошибка получения базовой брони:', error);
            }
        }
        
        // Добавляем бонусные статы от экипировки
        if (window.statCalculator?.equipmentStats) {
            Object.values(window.statCalculator.equipmentStats).forEach(slotStats => {
                if (Array.isArray(slotStats)) {
                    slotStats.forEach(equipStats => {
                        Object.keys(equipStats).forEach(statKey => {
                            const normalizedKey = this.normalizeStatKey(statKey);
                            baseStats[normalizedKey] = (baseStats[normalizedKey] || 0) + equipStats[statKey];
                        });
                    });
                }
            });
        }

        // Если есть щит, добавляем базовый блок от щита
        if (window.equipmentData?.lhand && window.equipmentData.lhand.leftHandType === 'shield') {
            try {
                const shieldBlock = window.armorCalculator.getShieldBaseBlock();
                if (shieldBlock && shieldBlock.block) {
                    baseStats.block = (baseStats.block || 0) + shieldBlock.block;
                    console.log(`🛡️ База блока для процентных камней: ${shieldBlock.block}`);
                }
            } catch (error) {
                console.error('Ошибка получения базового блока щита:', error);
            }
        }

        // Бонусы блока от рун для щита
        if (window.equipmentData?.lhand && 
            window.equipmentData.lhand.leftHandType === 'shield' && 
            window.equipmentData.lhand.runeLevel &&
            window.statCalculator?.runeCalculator) {
            try {
                const runeLevel = window.equipmentData.lhand.runeLevel;
                const runeBonus = window.statCalculator.runeCalculator.getRuneBonusForSlot('lhand', runeLevel);
                const shieldBlock = window.armorCalculator.getShieldBaseBlock();
                
                if (shieldBlock && shieldBlock.block && runeBonus > 0) {
                    const blockBonus = Math.round(shieldBlock.block * runeBonus);
                    baseStats.block = (baseStats.block || 0) + blockBonus;
                    console.log(`🛡️ Бонус блока от рун: +${blockBonus}`);
                }
            } catch (error) {
                console.error('Ошибка расчета бонуса блока от рун:', error);
            }
        }

        console.log('📊 База для процентных камней:', baseStats);
        return baseStats;
    }

    // Вспомогательный метод для нормализации ключей статистик
    normalizeStatKey(key) {
        const mapping = {
            'Сила атаки': 'attack_power',
            'Скорость атаки': 'attack_speed',
            'Точность': 'hit',
            'Шанс крита. урона': 'crit',
            'Парирование': 'parry',
            'Уклонения': 'dodge',
            'Сопр.маг': 'resist',
            'Блок': 'block',
            'Маг. броня': 'spell_armour',
            'Физ. броня': 'armour',
            'Восст. Энергии': 'mp_reg',
            'Восст. Здоровья': 'hp_reg',
            'Энергия': 'mp',
            'Здоровье': 'hp',
            'Сопр.крит': 'crit_damage_resistance',
        };
        return mapping[key] || key;
    }

    // Определяем тип камня по его ID и слоту
    isPercentageStone(stoneId, slotType) {
        return stoneId.includes('_percent') || 
               (this.isWeaponSlot(slotType) && !stoneId.includes('_stone'));
    }

    // ПРОСТОЙ И ПОНЯТНЫЙ МЕТОД ДЛЯ ОДНОГО КАМНЯ
    applySingleStoneBonus(stats, stoneId, stoneValue, isPercentage, baseStats) {
        const targetStat = this.getTargetStatFromStoneId(stoneId);
        
        if (!targetStat) {
            console.warn(`💎 Неизвестный камень: ${stoneId}`);
            return;
        }

        if (stats[targetStat] === undefined) {
            stats[targetStat] = 0;
        }

        if (isPercentage) {
            // ПРОЦЕНТНЫЕ КАМНИ: бонус от БАЗОВОГО значения стата (до применения других бонусов)
            const baseValue = baseStats[targetStat] || 0;
            const bonus = Math.round(baseValue * (stoneValue / 100));
            stats[targetStat] += bonus;
            console.log(`💎 Процентный бонус ${stoneId}: +${bonus} (${stoneValue}% от базового ${baseValue})`);
        } else {
            // Обычные камни: просто добавляем значение
            stats[targetStat] += stoneValue;
            console.log(`💎 Абсолютный бонус ${stoneId}: +${stoneValue}`);
        }
    }

    // ПРОСТАЯ ФУНКЦИЯ ДЛЯ ОПРЕДЕЛЕНИЯ ЦЕЛЕВОЙ ХАРАКТЕРИСТИКИ
    getTargetStatFromStoneId(stoneId) {
        const mapping = {
            // Обычные камни
            'hp': 'hp',
            'mp': 'mp',
            'attack_power': 'attack_power',
            'attack_speed': 'attack_speed', 
            'hit': 'hit',
            'dodge': 'dodge',
            'parry': 'parry',
            'resist': 'resist',
            'crit': 'crit',
            'armour': 'armour',
            'spell_armour': 'spell_armour',
            'block': 'block',
            'hp_reg': 'hp_reg',
            'mp_reg': 'mp_reg',
            'crit_damage_resistance': 'crit_damage_resistance',
            
            // Процентные камни
            'hp_percent': 'hp',
            'mp_percent': 'mp',
            'attack_power_percent': 'attack_power',
            'attack_speed_percent': 'attack_speed',
            'hit_percent': 'hit',
            'dodge_percent': 'dodge',
            'parry_percent': 'parry',
            'resist_percent': 'resist',
            'crit_percent': 'crit',
            'armour_percent': 'armour',
            'spell_armour_percent': 'spell_armour',
            'block_percent': 'block',
            'hp_reg_percent': 'hp_reg',
            'mp_reg_percent': 'mp_reg',
            'crit_damage_resistance_percent': 'crit_damage_resistance'
        };
        
        return mapping[stoneId];
    }

    addStones(slotType, stones) {
        if (!slotType || typeof slotType !== 'string') {
            console.error('💎 Ошибка: неверный тип слота');
            return;
        }
        
        if (!Array.isArray(stones)) {
            console.error('💎 Ошибка: stones должен быть массивом');
            return;
        }

        const isWeaponSlot = this.isWeaponSlot(slotType);
        
        stones.forEach(stone => {
            stone.isPercentage = isWeaponSlot;
        });

        this.stoneStats[slotType] = stones;
    }

    // Применение камней оружия (процентные бонусы)
    applyWeaponStoneBonuses(stats, slotType, stones) {
        const baseForPercentage = this.getBaseForWeaponStones(stats);
        
        console.log(`⚔️ База для процентных камней:`, baseForPercentage);
        
        stones.forEach(stone => {
            if (!stone || !stone.id) return;

            const stoneValue = this.getStoneValue(stone.id, stone.level);
            if (stoneValue !== null) {
                const normalizedKey = this.normalizeStoneKey(stone.id);
                const baseValue = baseForPercentage[normalizedKey] || 0;
                
                console.log(`⚔️ Оружейный камень: ${stone.id} ур.${stone.level} = ${stoneValue}%`);
                console.log(`⚔️ База для ${normalizedKey}: ${baseValue}`);
                
                // Инициализируем бонусную часть если ее нет
                if (stats[`bonus_${normalizedKey}`] === undefined) {
                    stats[`bonus_${normalizedKey}`] = 0;
                }
                
                // Для процентных камней используем значение как процент
                const percentage = stoneValue / 100;
                const bonusValue = Math.round(baseValue * percentage);
                
                console.log(`⚔️ Бонус от оружейного камня: ${bonusValue} (${stoneValue}% от ${baseValue})`);
                
                const currentTotal = stats[normalizedKey] || 0;
                const currentBonus = stats[`bonus_${normalizedKey}`] || 0;
                const currentBase = currentTotal - currentBonus; // Вычисляем базовую часть
                
                const newBonusValue = currentBonus + bonusValue;
                const newTotalValue = currentBase + newBonusValue;
                
                // Обновляем значения
                stats[`bonus_${normalizedKey}`] = newBonusValue;
                stats[normalizedKey] = newTotalValue;
                
                console.log(`⚔️ Итоговое значение ${normalizedKey}: база ${currentBase} + бонус ${newBonusValue} = ${newTotalValue}`);
            }
        });
    }

    // Получение базовых значений для оружейных камней
    getBaseForWeaponStones(stats) {
        const baseStats = { ...stats };
        
        if (window.armorCalculator && window.equipmentData) {
            try {
                const baseArmor = window.armorCalculator.calculateBaseArmor(
                    window.currentClass || 'warrior',
                    window.equipmentData,
                    window.statCalculator?.runeCalculator
                );
                
                if (baseArmor) {
                    baseStats.armour = (baseStats.armour || 0) + (baseArmor.armour || 0);
                    baseStats.spell_armour = (baseStats.spell_armour || 0) + (baseArmor.spell_armour || 0);
                    baseStats.block = (baseStats.block || 0) + (baseArmor.block || 0);
                }
            } catch (error) {
                console.error('Ошибка получения базовой брони:', error);
            }
        }
        
        return baseStats;
    }

    // УЛУЧШЕННАЯ НОРМАЛИЗАЦИЯ КЛЮЧЕЙ
    normalizeStoneKey(stoneId) {
        if (!stoneId) return stoneId;

        const mapping = {
            // Обычные камни (абсолютные значения)
            'hp_stone': 'hp',
            'mp_stone': 'mp', 
            'attack_power_stone': 'attack_power',
            'attack_speed_stone': 'attack_speed',
            'hit_stone': 'hit',
            'dodge_stone': 'dodge',
            'parry_stone': 'parry',
            'resist_stone': 'resist',
            'crit_stone': 'crit',
            'armour_stone': 'armour',
            'spell_armour_stone': 'spell_armour',
            'block_stone': 'block',
            'hp_reg_stone': 'hp_reg',
            'mp_reg_stone': 'mp_reg',
            'crit_damage_resistance_stone': 'crit_damage_resistance',
            
            // Оружейные камни (процентные)
            'hp_percent': 'hp',
            'mp_percent': 'mp',
            'attack_power_percent': 'attack_power',
            'attack_speed_percent': 'attack_speed',
            'hit_percent': 'hit',
            'dodge_percent': 'dodge',
            'parry_percent': 'parry',
            'resist_percent': 'resist',
            'crit_percent': 'crit',
            'armour_percent': 'armour',
            'spell_armour_percent': 'spell_armour',
            'block_percent': 'block',
            'hp_reg_percent': 'hp_reg',
            'mp_reg_percent': 'mp_reg',
            'crit_damage_resistance_percent': 'crit_damage_resistance'
        };
        
        if (mapping[stoneId]) {
            return mapping[stoneId];
        }
        
        const fullStoneId = Object.keys(mapping).find(key => mapping[key] === stoneId);
        
        if (fullStoneId) {
            console.log(`🔤 Обратная нормализация: ${stoneId} → ${fullStoneId}`);
            return fullStoneId;
        }
        
        console.log(`🔤 Ключ не изменен: ${stoneId}`);
        return stoneId;
    }

    getFullStoneId(normalizedKey, isWeaponStone = false) {
        const suffix = isWeaponStone ? '_percent' : '_stone';
        
        const mapping = {
            'hp': 'hp' + suffix,
            'mp': 'mp' + suffix,
            'attack_power': 'attack_power' + suffix,
            'attack_speed': 'attack_speed' + suffix,
            'hit': 'hit' + suffix,
            'dodge': 'dodge' + suffix,
            'parry': 'parry' + suffix,
            'resist': 'resist' + suffix,
            'crit': 'crit' + suffix,
            'armour': 'armour' + suffix,
            'spell_armour': 'spell_armour' + suffix,
            'block': 'block' + suffix,
            'hp_reg': 'hp_reg' + suffix,
            'mp_reg': 'mp_reg' + suffix,
            'crit_damage_resistance': 'crit_damage_resistance' + suffix
        };
        
        return mapping[normalizedKey] || normalizedKey;
    }

    getAvailableStones() {
        return Object.keys(this.stoneBonuses).map(stoneId => {
            const bonus = this.stoneBonuses[stoneId];
            return {
                id: stoneId,
                name: this.getStoneName(stoneId),
                type: bonus.type,
                values: bonus.values
            };
        });
    }

    // Проверка, является ли слот оружием или щитом
    isWeaponSlot(slotType) {
        const weaponSlots = ['rhand', 'lhand'];
        
        if (slotType === 'rhand') {
            return true;
        }
        
        if (slotType === 'lhand' && window.equipmentData?.lhand) {
            const leftHandType = window.equipmentData.lhand.leftHandType;
            return leftHandType === 'weapon' || leftHandType === 'shield';
        }
        
        return weaponSlots.includes(slotType);
    }

    getStoneValue(stoneId, level) {
        if (!stoneId || !level) {
            console.warn(`💎 Ошибка: stoneId или level не указаны`);
            return null;
        }

        if (level < 1 || level > 5) {
            console.warn(`💎 Ошибка: неверный уровень камня ${level}`);
            return null;
        }

        const stoneBonus = this.stoneBonuses[stoneId];
        if (!stoneBonus) {
            console.warn(`💎 Ошибка: не найден бонус для камня ${stoneId}`);
            return null;
        }

        const value = stoneBonus.values[level - 1];
        console.log(`💎 Значение камня ${stoneId} ур.${level}: ${value} (тип: ${stoneBonus.type})`);
        return value;
    }

    calculateStoneTotal() {
        const total = {};
        const baseTotal = {};
        const bonusTotal = {};
        
        Object.entries(this.stoneStats).forEach(([slotType, slotStones]) => {
            if (!Array.isArray(slotStones)) {
                return;
            }

            if (!this.isWeaponSlot(slotType)) {
                slotStones.forEach(stone => {
                    const stoneValue = this.getStoneValue(stone.id, stone.level);
                    if (stoneValue) {
                        const normalizedKey = this.normalizeStoneKey(stone.id);
                        bonusTotal[normalizedKey] = (bonusTotal[normalizedKey] || 0) + stoneValue;
                    }
                });
            }
        });
        
        // Собираем итоговые значения
        Object.keys(bonusTotal).forEach(key => {
            total[key] = bonusTotal[key];
            total[`bonus_${key}`] = bonusTotal[key]; 
            total[`base_${key}`] = 0; 
        });
        
        return total;
    }

    validateWeaponStones(slotType, stones) {
        if (!slotType || !stones) {
            return { valid: false, message: 'Неверные параметры валидации' };
        }

        const maxStones = this.getMaxStonesForWeapon(slotType);
        
        if (stones.length > maxStones) {
            const errorMsg = `Максимум ${maxStones} камней в ${slotType === 'rhand' ? 'оружие' : 'щит'}`;
            return { valid: false, message: errorMsg };
        }

        const stoneCounts = {};
        stones.forEach(stone => {
            if (!stone || !stone.id) return;
            stoneCounts[stone.id] = (stoneCounts[stone.id] || 0) + 1;
        });

        for (const [stoneId, count] of Object.entries(stoneCounts)) {
            if (count > 2) {
                return { valid: false, message: 'Максимум 2 одинаковых камня в оружии' };
            }
        }

        return { valid: true };
    }

    getMaxStonesForWeapon(slotType) {
        if (!slotType) return 2;
        if (slotType === 'rhand') {
            const weaponType = window.equipmentData?.rhand?.weaponType;
            return weaponType === 'two-handed' ? 6 : 3;
        } else if (slotType === 'lhand') {
            return 3;
        }
        return 2;
    }

    removeStones(slotType) {
        if (!slotType) return;
        if (this.stoneStats[slotType]) {
            delete this.stoneStats[slotType];
            console.log(`💎 Камни удалены из слота ${slotType}`);
        }
    }

    getStoneBonuses() {
        return this.stoneBonuses;
    }

    reset() {
        this.stoneStats = {};
        console.log('💎 Все камни сброшены');
    }
}

window.stoneCalculator = new StoneCalculator();