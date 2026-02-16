class StatCalculator {
    constructor() {
        this.baseStats = {};
        this.equipmentStats = {};
        this.talentStats = {};
        this.runeStats = {};
        this.stoneStats = {};
        this.elixirStats = {};
        this.talentPoints = {};
        this.guildBuff = false;
        this.currentClass = null;
        this.talentAuras = {};

        // Инициализация зависимостей с защитой от ошибок
        this.initializeDependencies();
    }

    // Метод для безопасной инициализации зависимостей
    initializeDependencies() {
        if (typeof StoneCalculator !== 'undefined') {
            this.stoneCalculator = new StoneCalculator();
        } else {
            console.warn('StoneCalculator не найден, использую заглушку');
            this.stoneCalculator = { 
                addStones: () => {}, 
                applyStoneBonuses: (stats) => stats,
                removeStones: () => {},
                reset: () => {},
                calculateStoneTotal: () => ({})
            };
        }
        
        if (typeof RuneCalculator !== 'undefined') {
            this.runeCalculator = new RuneCalculator();
        } else {
            console.warn('RuneCalculator не найден, использую заглушку');
            this.runeCalculator = { 
                setRuneLevel: () => {}, 
                applyRuneBonuses: (stats) => stats,
                reset: () => {},
                getRuneBonuses: () => ({})
            };
        }
        
        if (typeof ElixirCalculator !== 'undefined') {
            this.elixirCalculator = new ElixirCalculator();
        } else {
            console.warn('ElixirCalculator не найден, использую заглушку');
            this.elixirCalculator = { 
                setElixirs: () => {}, 
                setGuildBuff: () => {},
                applyArmorBonuses: (stats) => stats,
                applyPercentageBonuses: (stats) => stats,
                reset: () => {},
                getElixirBonuses: () => ({})
            };
        }
        
        if (typeof TalentCalculator !== 'undefined') {
            this.talentCalculator = new TalentCalculator();
        } else {
            console.warn('TalentCalculator не найден, использую заглушку');
            this.talentCalculator = { 
                applyTalentBonuses: (stats) => stats 
            };
        }

        // Инициализация armorCalculator если он нужен
        if (typeof ArmorCalculator !== 'undefined' && typeof window.armorCalculator === 'undefined') {
            window.armorCalculator = new ArmorCalculator();
        }
    }

    static preciseRound(value, precision = 0) {
        if (typeof value !== 'number') return 0;
        const multiplier = Math.pow(10, precision);
        return Math.round(value * multiplier) / multiplier;
    }

    setTalentAuras(auras) {
        this.talentAuras = { ...auras };
    }

    applyPriestWeaponBonuses(totalStats) {
        if (this.currentClass !== 'priest' || !window.equipmentData) {
            return totalStats;
        }

        try {
            if (window.priestBonuses && typeof window.priestBonuses.applyPriestBonuses === 'function') {
                return window.priestBonuses.applyPriestBonuses(
                    totalStats,
                    this.currentClass,
                    window.equipmentData
                );
            }
        } catch (error) {
            console.error('Ошибка в бустах жреца:', error);
        }

        return totalStats;
    }

    hasPriestWeaponConfiguration() {
        if (this.currentClass !== 'priest' || !window.equipmentData) {
            return false;
        }
        
        const rightHand = window.equipmentData.rhand;
        const leftHand = window.equipmentData.lhand;
        
        if (!rightHand) {
            return false;
        }
        
        const weaponType = rightHand.weaponType;
        const leftHandType = leftHand?.leftHandType;
        
        if (weaponType === 'one-handed' && leftHandType === 'weapon') {
            return true;
        }
        else if (weaponType === 'one-handed' && leftHandType === 'shield') {
            return true;
        }
        else if (weaponType === 'two-handed') {
            return true;
        }
        
        return false;
    }

    // Установка очков талантов
    setTalentPoints(characterClass, talentPoints) {
        this.talentPoints[characterClass] = { ...talentPoints };
    }

    // Установка базовых статистик класса
    setBaseStats(characterClass, stats) {
        if (!characterClass || !stats) {
            console.error('Некорректные параметры для setBaseStats:', { characterClass, stats });
            return;
        }

        console.log('✅ Установка базовых статов для класса:', characterClass, stats);
        
        this.baseStats[characterClass] = { ...stats };
        this.currentClass = characterClass;
        
        // Проверяем, что статы действительно установлены
        if (!this.baseStats[characterClass]) {
            console.error('❌ Не удалось установить базовые статы для класса:', characterClass);
        }
    }

    // Проверка готовности калькулятора
    isReady() {
        return this.currentClass && this.baseStats[this.currentClass];
    }

    // Безопасный метод получения базовых статов
    getBaseStats() {
        if (!this.currentClass) {
            console.warn('Текущий класс не установлен');
            return {};
        }
        
        const baseStats = this.baseStats[this.currentClass];
        if (!baseStats) {
            console.warn('Базовые статы не найдены для класса:', this.currentClass);
            return {};
        }
        
        return baseStats;
    }

    static preciseRound(value, precision = 0) {
        if (typeof value !== 'number') return 0;
        const multiplier = Math.pow(10, precision);
        return Math.round(value * multiplier) / multiplier;
    }

    // Добавление статистик от экипировки
    addEquipmentStats(slotType, stats) {
        if (!this.equipmentStats[slotType]) {
            this.equipmentStats[slotType] = [];
        }
        this.equipmentStats[slotType].push(stats);
    }

    // Установка уровня рун
    setRuneLevel(slotType, runeLevel) {
        this.runeStats[slotType] = runeLevel;
        if (this.runeCalculator && this.runeCalculator.setRuneLevel) {
            this.runeCalculator.setRuneLevel(slotType, runeLevel);
        }
    }

    // Добавление камней
    addStones(slotType, stones) {
        if (!this.stoneStats[slotType]) {
            this.stoneStats[slotType] = [];
        }
        this.stoneStats[slotType] = stones;
        if (this.stoneCalculator && this.stoneCalculator.addStones) {
            this.stoneCalculator.addStones(slotType, stones);
        }
    }

    // Установка эликсиров (делегируем ElixirCalculator)
    setElixirs(offensiveElixir, defensiveElixir) {
        this.elixirStats.offensive = offensiveElixir;
        this.elixirStats.defensive = defensiveElixir;
        if (this.elixirCalculator && this.elixirCalculator.setElixirs) {
            this.elixirCalculator.setElixirs(offensiveElixir, defensiveElixir);
        }
    }

    // Установка гильдейского баффа (делегируем ElixirCalculator)
    setGuildBuff(enabled) {
        this.guildBuff = enabled;
        if (this.elixirCalculator && this.elixirCalculator.setGuildBuff) {
            this.elixirCalculator.setGuildBuff(enabled);
        }
    }

    static formatNumber(number) {
        if (typeof number !== 'number') {
            return '0';
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    updateStats() {
        try {
            // Проверяем готовность калькулятора
            if (!this.isReady()) {
                console.warn('Калькулятор не готов для обновления статов. Текущий класс:', this.currentClass);
                
                // Пытаемся инициализировать базовые статы
                if (this.currentClass && window.characterStats && window.characterStats[this.currentClass]) {
                    console.log('🔄 Инициализируем базовые статы для класса:', this.currentClass);
                    this.setBaseStats(this.currentClass, window.characterStats[this.currentClass]);
                } else {
                    return; // Не продолжаем если калькулятор не готов
                }
            }

            // Инициализируем armorCalculator если нужно
            if (typeof window.armorCalculator === 'undefined') {
                if (typeof ArmorCalculator !== 'undefined') {
                    window.armorCalculator = new ArmorCalculator();
                } else {
                    console.error('ArmorCalculator не найден');
                    return;
                }
            }
            
            if (typeof window.equipmentData === 'undefined') {
                window.equipmentData = {};
            }

            // Расчет статистик
            const totalStats = this.calculateTotalStats();
            
            // Обновляем отображение
            if (typeof window.updateStatsDisplay === 'function') {
                window.updateStatsDisplay(totalStats);
            }
            
            // Обновляем отображение брони
            this.updateArmorStats(totalStats);
            
        } catch (error) {
            console.error('Ошибка в updateStats:', error);
        }
    }

    updateArmorStats(totalStats) {
        if (!totalStats || typeof totalStats !== 'object') {
            totalStats = { armour: 0, spell_armour: 0, block: 0 };
        }

        const armorElement = document.getElementById('armour');
        const spellArmorElement = document.getElementById('spell_armour');
        const blockElement = document.getElementById('block');
        
        if (armorElement) {
            armorElement.textContent = StatCalculator.formatNumber(totalStats.armour || 0);
        }
        
        if (spellArmorElement) {
            spellArmorElement.textContent = StatCalculator.formatNumber(totalStats.spell_armour || 0);
        }
        
        if (blockElement) {
            blockElement.textContent = StatCalculator.formatNumber(totalStats.block || 0);
        }
    }

    // Упрощенный расчет брони
    calculateTotalArmor() {
        try {
            if (!this.isReady()) {
                return { armour: 0, spell_armour: 0, block: 0 };
            }
            
            let totalStats = this.calculateTotalStats();
            
            // Получаем базовые значения для процентных расчетов
            const baseForPercentage = this.getBaseForPercentage();
            
            // Применяем бонусы эликсиров и гильдейского баффа к броне
            if (this.elixirCalculator) {
                const armorStats = {
                    armour: totalStats.armour || 0,
                    spell_armour: totalStats.spell_armour || 0,
                    block: totalStats.block || 0
                };
                
                const boostedArmor = this.elixirCalculator.applyArmorBonuses(armorStats, baseForPercentage);
                
                totalStats.armour = boostedArmor.armour;
                totalStats.spell_armour = boostedArmor.spell_armour;
                totalStats.block = boostedArmor.block;
            }
            
            return {
                armour: totalStats.armour || 0,
                spell_armour: totalStats.spell_armour || 0,
                block: totalStats.block || 0
            };
        } catch (error) {
            console.error('Ошибка в calculateTotalArmor:', error);
            return { armour: 0, spell_armour: 0, block: 0 };
        }
    }

    // Расчет базовой брони от экипировки
    calculateBaseArmorFromEquipment() {
        let totalArmor = { armour: 0, spell_armour: 0 };
        
        if (!window.equipmentData || !this.currentClass) {
            return totalArmor;
        }

        const armorSlots = ['helm', 'shoulders', 'chest', 'pants', 'boots', 'hands', 'bracers', 'belt', 'cape'];
        
        armorSlots.forEach(slotType => {
            if (window.equipmentData[slotType]) {
                const slotArmor = window.armorCalculator.getBaseArmor(
                    this.currentClass, 
                    slotType,
                    '3-stat',
                    'orange',
                    'orange'
                );
                
                if (slotArmor) {
                    totalArmor.armour += slotArmor.armour || 0;
                    totalArmor.spell_armour += slotArmor.spell_armour || 0;
                }
            }
        });

        return totalArmor;
    }

    // Расчет всех статистик
    calculateTotalStats() {
        // Проверяем готовность калькулятора
        if (!this.isReady()) {
            console.warn('Невозможно рассчитать статистики: калькулятор не готов');
            console.log('Текущий класс:', this.currentClass);
            console.log('Доступные классы:', Object.keys(this.baseStats));
            return {};
        }

        const currentClassStats = this.baseStats[this.currentClass];
        if (!currentClassStats) {
            console.error('Базовые статистики не найдены для класса:', this.currentClass);
            return {};
        }

        // Шаг 1: Базовые статистики класса
        let totalStats = { ...currentClassStats };

        // Шаг 2: Базовая броня от экипировки
        const baseArmor = this.calculateBaseArmorFromAllEquipment();
        totalStats.armour += baseArmor.armour || 0;
        totalStats.spell_armour += baseArmor.spell_armour || 0;
        totalStats.block += baseArmor.block || 0;

        // Шаг 3: Статистики от экипировки
        totalStats = this.addEquipmentStatsToTotal(totalStats);
        
        // Шаг 4: Получаем БАЗОВЫЕ значения для процентных расчетов
        const baseForPercentage = this.getBaseForPercentage();
        
        // Шаг 5: Бонусы от талантов
        if (this.talentPoints[this.currentClass] && this.talentCalculator) {
            const hasTalents = Object.values(this.talentPoints[this.currentClass]).some(points => points > 0);
            if (hasTalents) {
                const talentBonuses = this.talentCalculator.calculateTalentBonuses(
                    this.currentClass, 
                    this.talentPoints[this.currentClass], 
                    baseForPercentage
                );
                
                Object.keys(talentBonuses).forEach(stat => {
                    if (totalStats[stat] !== undefined && talentBonuses[stat] > 0) {
                        const baseValue = baseForPercentage[stat] || 0;
                        const talentBonus = talentBonuses[stat];
                        const valueAfterTalents = Math.floor(baseValue + talentBonus);
                        totalStats[stat] = valueAfterTalents;
                    }
                });
            }
        }
        
        // Шаг 6: Бонусы от эликсиров и гильдейского баффа
        if (this.elixirCalculator) {
            totalStats = this.applyElixirAndGuildBonuses(totalStats, baseForPercentage);
        }
        
        // Шаг 7: Бонусы от рун
        if (this.runeCalculator && this.runeCalculator.applyRuneBonuses) {
            totalStats = this.runeCalculator.applyRuneBonuses(totalStats, this.equipmentStats);
        }
        
        // Шаг 8: Бонусы от камней
        if (this.stoneCalculator && this.stoneCalculator.applyStoneBonuses) {
            totalStats = this.stoneCalculator.applyStoneBonuses(totalStats);
        }
        
        // Шаг 9: Специальные бонусы жреца
        totalStats = this.applyPriestWeaponBonuses(totalStats);
        
        // Шаг 10: Активные ауры талантов
        totalStats = this.applyTalentAuras(totalStats);

        return this.convertToInt(totalStats);
    }

    applyElixirAndGuildBonuses(totalStats, baseForPercentage) {
        let stats = { ...totalStats };
        try {
            if (this.elixirCalculator) {
                const elixirBonuses = this.elixirCalculator.elixirBonuses;
                
                const offensiveElixir = this.elixirStats.offensive;
                const defensiveElixir = this.elixirStats.defensive;
                
                if (offensiveElixir && offensiveElixir !== 'none') {
                    const offensiveBonus = elixirBonuses[offensiveElixir];
                    if (offensiveBonus && offensiveBonus.stats) {
                        Object.keys(offensiveBonus.stats).forEach(stat => {
                            if (baseForPercentage && baseForPercentage[stat] !== undefined) {
                                const bonusPercent = offensiveBonus.stats[stat];
                                const baseValue = parseFloat(baseForPercentage[stat]);
                                const bonusValue = Math.floor(baseValue * bonusPercent);
                                
                                if (bonusValue > 0) {
                                    stats[stat] = (stats[stat] || 0) + bonusValue;
                                }
                            }
                        });
                    }
                }

                if (defensiveElixir && defensiveElixir !== 'none') {
                    const defensiveBonus = elixirBonuses[defensiveElixir];
                    if (defensiveBonus && defensiveBonus.stats) {
                        Object.keys(defensiveBonus.stats).forEach(stat => {
                            if (baseForPercentage && baseForPercentage[stat] !== undefined) {
                                const bonusPercent = defensiveBonus.stats[stat];
                                const baseValue = parseFloat(baseForPercentage[stat]);
                                const bonusValue = Math.floor(baseValue * bonusPercent);
                                
                                if (bonusValue > 0) {
                                    stats[stat] = (stats[stat] || 0) + bonusValue;
                                }
                            }
                        });
                    }
                }
                
                if (this.guildBuff && this.elixirCalculator.applyGuildBuffToStats) {
                    stats = this.elixirCalculator.applyGuildBuffToStats(stats, baseForPercentage);
                }
            }
            
            return stats;
        } catch (error) {
            console.error('Ошибка в applyElixirAndGuildBonuses:', error);
            return totalStats;
        }
    }

    applyElixirBonuses(stats, baseForPercentage) {
        try {
            const elixirBonuses = this.elixirCalculator.elixirBonuses;

            const offensiveElixir = this.elixirStats.offensive;
            const defensiveElixir = this.elixirStats.defensive;
            
            if (offensiveElixir && offensiveElixir !== 'none') {
                const offensiveBonus = elixirBonuses[offensiveElixir];
                if (offensiveBonus && offensiveBonus.stats) {
                    Object.keys(offensiveBonus.stats).forEach(stat => {
                        if (baseForPercentage && baseForPercentage[stat] !== undefined) {
                            const bonusPercent = offensiveBonus.stats[stat];
                            const baseValue = parseFloat(baseForPercentage[stat]);
                            const bonusValue = Math.floor(baseValue * bonusPercent);
                            
                            if (bonusValue > 0) {
                                stats[stat] = (stats[stat] || 0) + bonusValue;
                            }
                        }
                    });
                }
            }

            if (defensiveElixir && defensiveElixir !== 'none') {
                const defensiveBonus = elixirBonuses[defensiveElixir];
                if (defensiveBonus && defensiveBonus.stats) {
                    Object.keys(defensiveBonus.stats).forEach(stat => {
                        if (baseForPercentage && baseForPercentage[stat] !== undefined) {
                            const bonusPercent = defensiveBonus.stats[stat];
                            const baseValue = parseFloat(baseForPercentage[stat]);
                            const bonusValue = Math.floor(baseValue * bonusPercent);
                            
                            if (bonusValue > 0) {
                                stats[stat] = (stats[stat] || 0) + bonusValue;
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка в applyElixirBonuses:', error);
        }
    }

    applyGuildBuffBonuses(stats, baseForPercentage) {
        try {
            if (!stats || !baseForPercentage) {
                console.error('Некорректные параметры в applyGuildBuffBonuses');
                return;
            }

            // Основной бонус 3% ко ВСЕМ статам кроме скорости передвижения
            Object.keys(baseForPercentage).forEach(stat => {
                // Исключаем только скорость передвижения из гильдейского баффа
                if (stat !== 'speed' && typeof baseForPercentage[stat] === 'number') {
                    const baseValue = baseForPercentage[stat];
                    const bonusValue = Math.floor(baseValue * this.guildBuffBonus);
                    
                    if (bonusValue > 0) {
                        stats[stat] = (stats[stat] || 0) + bonusValue;
                    }
                }
            });

            // Дополнительный бонус 5% к здоровью (поверх основного 3%)
            if (baseForPercentage.hp !== undefined) {
                const baseHP = baseForPercentage.hp;
                const healthBonus = Math.floor(baseHP * this.guildBuffHealthBonus);
                
                if (healthBonus > 0) {
                    stats.hp += healthBonus;
                }
            }

            // Дополнительный бонус 5% к сопротивлению критическому урону (поверх основного 3%)
            if (baseForPercentage.crit_damage_resistance !== undefined) {
                const baseCritResistance = baseForPercentage.crit_damage_resistance;
                const critResistanceBonus = Math.floor(baseCritResistance * this.guildBuffCritResistanceBonus);
                
                if (critResistanceBonus > 0) {
                    stats.crit_damage_resistance += critResistanceBonus;
                }
            }

        } catch (error) {
            console.error('Ошибка в applyGuildBuffBonuses:', error);
        }
    }

    // Обновленный метод для применения бонусов талантов
    applyTalentBonuses(totalStats, talentBonuses, baseForPercentage) {
        const stats = { ...totalStats };
        
        Object.keys(talentBonuses).forEach(stat => {
            if (stats[stat] !== undefined && talentBonuses[stat] > 0) {
                const baseValue = baseForPercentage[stat] || 0;
                const talentBonus = talentBonuses[stat];
                
                // Рассчитываем новое значение с учетом бонуса талантов
                const valueAfterTalents = Math.floor(baseValue + talentBonus);
                stats[stat] = valueAfterTalents;
            }
        });
        
        return stats;
    }

    convertToInt(stats) {
        const result = {};
        for (const [key, value] of Object.entries(stats)) {
            if (typeof value === 'number') {
                result[key] = Math.round(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    
    calculateBaseArmorFromAllEquipment() {
        let totalArmor = { armour: 0, spell_armour: 0, block: 0 };
        
        if (!window.equipmentData || !this.currentClass) {
            return totalArmor;
        }

        // Броня от обычной экипировки
        const armorSlots = ['helm', 'shoulders', 'chest', 'pants', 'boots', 'hands', 'bracers', 'belt'];
        
        armorSlots.forEach(slotType => {
            if (window.equipmentData[slotType]) {
                const slotData = window.equipmentData[slotType];
                const slotArmor = window.armorCalculator.getBaseArmor(
                    this.currentClass, 
                    slotType,
                    slotData.equipmentType || '3-stat'
                );
                
                if (slotArmor) {
                    totalArmor.armour += slotArmor.armour || 0;
                    totalArmor.spell_armour += slotArmor.spell_armour || 0;
                }
            }
        });

        // Броня от плаща
        if (window.equipmentData.cape) {
            const capeData = window.equipmentData.cape;
            const capeArmor = window.armorCalculator.getBaseArmor(
                this.currentClass,
                'cape',
                capeData.equipmentType || '3-stat',
                capeData.quality || 'orange'
            );
            
            if (capeArmor) {
                totalArmor.armour += capeArmor.armour || 0;
                totalArmor.spell_armour += capeArmor.spell_armour || 0;
            }
        }

        // Броня от бижутерии
        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        jewelrySlots.forEach(slotType => {
            if (window.equipmentData[slotType]) {
                const jewelryData = window.equipmentData[slotType];
                if (jewelryData.quality === 'orange') {
                    const runeBonus = window.armorCalculator.jewelryRuneBonuses[jewelryData.runeLevel] || window.armorCalculator.jewelryRuneBonuses[0];
                    
                    totalArmor.armour += runeBonus.armour || 0;
                    totalArmor.spell_armour += runeBonus.spell_armour || 0;
                }
            }
        });

        // Блок от щита
        if (window.equipmentData?.lhand && window.equipmentData.lhand.leftHandType === 'shield') {
            const shieldData = window.equipmentData.lhand;
            const shieldBlock = window.armorCalculator.getShieldBaseBlock().block || 0;
            
            let runeMultiplier = 0;
            if (this.runeCalculator && shieldData.runeLevel) {
                runeMultiplier = this.runeCalculator.getRuneBonusForSlot('lhand', shieldData.runeLevel) || 0;
            }
            
            const blockBonus = Math.round(shieldBlock * runeMultiplier);
            totalArmor.block += shieldBlock + blockBonus;
        }

        return totalArmor;
    }

    // Метод для применения активных аур талантов
    applyTalentAuras(totalStats) {
        const stats = { ...totalStats };
        
        Object.keys(this.talentAuras).forEach(statKey => {
            const value = this.talentAuras[statKey];
            
            if (statKey.endsWith('_percent')) {
                const baseStatKey = statKey.replace('_percent', '');
                if (stats[baseStatKey] !== undefined) {
                    const bonus = Math.round(stats[baseStatKey] * (value / 100));
                    stats[baseStatKey] += bonus;
                }
            } else {
                if (stats[statKey] !== undefined) {
                    stats[statKey] += value;
                } else {
                    stats[statKey] = value;
                }
            }
        });
        
        return stats;
    }

    // Вспомогательные методы
    addEquipmentStatsToTotal(totalStats) {
        const stats = { ...totalStats };

        // Инициализируем все возможные статы
        const allStats = [
            'attack_power', 'attack_speed', 'hit', 'crit', 'parry', 'dodge', 
            'resist', 'block', 'armour', 'spell_armour', 'hp', 'mp', 
            'hp_reg', 'mp_reg', 'crit_damage_resistance'
        ];
        
        allStats.forEach(stat => {
            if (stats[stat] === undefined) {
                stats[stat] = 0.0;
            }
        });

        // Суммируем статистики
        Object.keys(this.equipmentStats).forEach(slotType => {
            const slotStats = this.equipmentStats[slotType];
            if (Array.isArray(slotStats)) {
                slotStats.forEach(equipStats => {
                    Object.keys(equipStats).forEach(statKey => {
                        const normalizedKey = this.normalizeStatKey(statKey);
                        const value = parseFloat(equipStats[statKey]) || 0;
                        
                        if (stats[normalizedKey] !== undefined) {
                            stats[normalizedKey] += value;
                        } else {
                            stats[normalizedKey] = value;
                        }
                    });
                });
            }
        });

        return stats;
    }

    // Добавляем метод для очистки статистик слота
    removeEquipmentStats(slotType) {
        delete this.equipmentStats[slotType];
        delete this.runeStats[slotType];
        delete this.stoneStats[slotType];
        if (this.stoneCalculator && this.stoneCalculator.removeStones) {
            this.stoneCalculator.removeStones(slotType);
        }
    }
    
    getBaseForPercentage() {
        // Проверяем готовность
        if (!this.isReady()) {
            console.warn('Невозможно получить базовые значения: калькулятор не готов');
            return {};
        }
        
        // Начинаем с базовых статов класса
        const base = { ...this.baseStats[this.currentClass] };
        
        // Добавляем базовую броню от экипировки
        const baseArmor = this.calculateBaseArmorFromAllEquipment();
        base.armour = (base.armour || 0) + (baseArmor.armour || 0);
        base.spell_armour = (base.spell_armour || 0) + (baseArmor.spell_armour || 0);
        base.block = (base.block || 0) + (baseArmor.block || 0);
        
        // Добавляем бонусные статы от экипировки
        Object.keys(this.equipmentStats).forEach(slotType => {
            this.equipmentStats[slotType].forEach(equipStats => {
                Object.keys(equipStats).forEach(statKey => {
                    const normalizedKey = this.normalizeStatKey(statKey);
                    const value = parseFloat(equipStats[statKey]) || 0;
                    
                    if (base[normalizedKey] !== undefined) {
                        base[normalizedKey] += value;
                    } else {
                        base[normalizedKey] = value;
                    }
                });
            });
        });

        // Убедимся, что все основные статы присутствуют
        const requiredStats = [
            'attack_power', 'attack_speed', 'hit', 'crit', 'parry', 'dodge',
            'resist', 'block', 'spell_armour', 'armour', 'mp_reg', 'hp_reg',
            'mp', 'hp', 'crit_damage_resistance'
        ];
        
        requiredStats.forEach(stat => {
            if (base[stat] === undefined) {
                base[stat] = 0;
            }
        });

        return base;
    }

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
            
            'armour': 'armour',
            'spell_armour': 'spell_armour',
            'block': 'block',
            'hp': 'hp',
            'mp': 'mp',
            'attack_power': 'attack_power',
            'attack_speed': 'attack_speed',
            'hit': 'hit',
            'crit': 'crit',
            'parry': 'parry',
            'dodge': 'dodge',
            'resist': 'resist',
            'hp_reg': 'hp_reg',
            'mp_reg': 'mp_reg',
            'crit_damage_resistance': 'crit_damage_resistance'
        };
        return mapping[key] || key;
    }

    // Сброс всех статистик
    reset() {
        this.equipmentStats = {};
        this.runeStats = {};
        this.stoneStats = {};
        this.talentStats = {};
        this.elixirStats = {};
        this.guildBuff = false;
        
        if (this.stoneCalculator && this.stoneCalculator.reset) {
            this.stoneCalculator.reset();
        }
        if (this.runeCalculator && this.runeCalculator.reset) {
            this.runeCalculator.reset();
        }
        if (this.elixirCalculator && this.elixirCalculator.reset) {
            this.elixirCalculator.reset();
        }

        if (this.currentClass && this.talentPoints[this.currentClass]) {
            Object.keys(this.talentPoints[this.currentClass]).forEach(branch => {
                this.talentPoints[this.currentClass][branch] = 0;
            });
        }
    }

    // Получение детальной информации
    getBonusBreakdown() {
        return {
            baseStats: this.getBaseStats(),
            equipmentBonus: this.calculateEquipmentTotal(),
            stoneBonus: this.stoneCalculator.calculateStoneTotal ? this.stoneCalculator.calculateStoneTotal() : {},
            runeBonus: this.runeCalculator.getRuneBonuses ? this.runeCalculator.getRuneBonuses() : {},
            elixirBonus: this.elixirCalculator.getElixirBonuses ? this.elixirCalculator.getElixirBonuses() : {},
            guildBuff: this.guildBuff
        };
    }

    calculateEquipmentTotal() {
        const total = {};
        Object.values(this.equipmentStats).forEach(slotStats => {
            slotStats.forEach(equipStats => {
                Object.keys(equipStats).forEach(statKey => {
                    const normalizedKey = this.normalizeStatKey(statKey);
                    if (total[normalizedKey] !== undefined) {
                        total[normalizedKey] += equipStats[statKey];
                    } else {
                        total[normalizedKey] = equipStats[statKey];
                    }
                });
            });
        });
        return total;
    }

    

}

// Создаем глобальный экземпляр калькулятора
window.statCalculator = new StatCalculator();