// rune_calculator.js
class RuneCalculator {
    constructor() {
        this.runeStats = {};
        
        this.runeBonuses = {
            1: { equipment: 0.105, jewelry: 0.10, weapon: 0.105 },
            2: { equipment: 0.21, jewelry: 0.25, weapon: 0.21 },
            3: { equipment: 0.315, jewelry: 0.40, weapon: 0.315 },
            4: { equipment: 0.42, jewelry: 0.55, weapon: 0.42 },
            5: { equipment: 0.525, jewelry: 0.70, weapon: 0.525 },
            6: { equipment: 0.63, jewelry: 0.85, weapon: 0.63 },
            7: { equipment: 0.735, jewelry: 1.00, weapon: 0.735 },
            8: { equipment: 0.84, jewelry: 1.15, weapon: 0.84 },
            9: { equipment: 0.88, jewelry: 1.20, weapon: 0.88 },
            10: { equipment: 0.92, jewelry: 1.25, weapon: 0.92 },
            11: { equipment: 0.96, jewelry: 1.30, weapon: 0.96 },
            12: { equipment: 1.00, jewelry: 1.35, weapon: 1.00 }
        };

        this.equipmentSlots = ['chest', 'helm', 'shoulders', 'pants', 'boots', 'hands', 'bracers', 'belt', 'cape'];
        this.jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        this.weaponSlots = ['rhand', 'lhand'];
    }

    setRuneLevel(slotType, runeLevel) {
        if (runeLevel >= 0 && runeLevel <= 12) {
            this.runeStats[slotType] = runeLevel;
        }
    }

    // Получение множителя рун для слота
    getRuneMultiplier(slotType, runeLevel) {
        // 0 уровень - нет бонуса
        if (runeLevel === 0 || runeLevel === '0' || !runeLevel) {
            return 0;
        }
        
        const level = parseInt(runeLevel, 10);
        if (isNaN(level) || level < 1 || level > 12) {
            return 0;
        }
        
        const runeData = this.runeBonuses[level];
        if (!runeData) return 0;
        
        // Определяем тип слота и возвращаем соответствующий множитель
        if (this.equipmentSlots.includes(slotType)) {
            return runeData.equipment || 0;
        } else if (this.jewelrySlots.includes(slotType)) {
            return runeData.jewelry || 0;
        } else if (this.weaponSlots.includes(slotType)) {
            return runeData.weapon || 0;
        }
        
        return 0;
    }

    // Расчет бонуса от рун для конкретного предмета
    calculateItemRuneBonus(itemStats, slotType, runeLevel) {
        const multiplier = this.getRuneMultiplier(slotType, runeLevel);
        if (multiplier === 0 || !itemStats) return {};
        
        const bonus = {};
        Object.entries(itemStats).forEach(([stat, value]) => {
            // Не применяем руны к процентным статам
            if (!stat.includes('_percent')) {
                const bonusValue = Math.round(value * multiplier);
                if (bonusValue > 0) {
                    bonus[stat] = bonusValue;
                }
            }
        });
        
        return bonus;
    }

    // Получение базовых значений брони для слота с учетом класса
    getBaseArmorForSlot(className, slotType, subType = null) {
        if (!window.armorCalculator) return { armour: 0, spell_armour: 0, block: 0 };
        
        // Для плаща
        if (slotType === 'cape' && subType) {
            const capeBase = window.armorCalculator.capeBaseArmorValues[subType];
            if (capeBase) {
                return {
                    armour: capeBase.armour || 0,
                    spell_armour: capeBase.spell_armour || 0
                };
            }
        }
        
        // Для обычных слотов брони
        if (window.armorCalculator.baseArmorValues[className] && 
            window.armorCalculator.baseArmorValues[className][slotType]) {
            return { ...window.armorCalculator.baseArmorValues[className][slotType] };
        }
        
        // Для щита
        if (slotType === 'shield' || slotType === 'lhand') {
            if (window.armorCalculator.baseArmorValues[className] && 
                window.armorCalculator.baseArmorValues[className]['shield']) {
                return { ...window.armorCalculator.baseArmorValues[className]['shield'] };
            }
        }
        
        return { armour: 0, spell_armour: 0, block: 0 };
    }

    // Расчет бонуса рун для базовой брони слота
    calculateBaseArmorRuneBonus(className, slotType, runeLevel, subType = null) {
        const multiplier = this.getRuneMultiplier(slotType, runeLevel);
        if (multiplier === 0) return { armour: 0, spell_armour: 0, block: 0 };
        
        const baseArmor = this.getBaseArmorForSlot(className, slotType, subType);
        
        const bonus = {};
        if (baseArmor.armour) {
            bonus.armour = Math.round(baseArmor.armour * multiplier);
        }
        if (baseArmor.spell_armour) {
            bonus.spell_armour = Math.round(baseArmor.spell_armour * multiplier);
        }
        if (baseArmor.block) {
            bonus.block = Math.round(baseArmor.block * multiplier);
        }
        
        return bonus;
    }

    // Полный расчет всех бонусов рун для экипировки
    calculateAllRuneBonuses(className, equipmentData) {
        const results = {
            flat: {},
            bySlot: {}
        };
        
        if (!equipmentData) return results;
        
        Object.entries(equipmentData).forEach(([slotType, itemData]) => {
            if (!itemData) return;
            
            const runeLevel = itemData.runeLevel || 0;
            if (runeLevel === 0) return;
            
            const slotBonus = {
                base: {},
                item: {}
            };
            
            // 1. Бонус к базовой броне слота
            const baseBonus = this.calculateBaseArmorRuneBonus(
                className, 
                slotType, 
                runeLevel, 
                itemData.quality || itemData.subType
            );
            
            if (Object.keys(baseBonus).length > 0) {
                slotBonus.base = baseBonus;
                Object.entries(baseBonus).forEach(([stat, value]) => {
                    results.flat[stat] = (results.flat[stat] || 0) + value;
                });
            }
            
            // 2. Бонус к дополнительным статам предмета
            if (itemData.stats) {
                const itemBonus = this.calculateItemRuneBonus(itemData.stats, slotType, runeLevel);
                if (Object.keys(itemBonus).length > 0) {
                    slotBonus.item = itemBonus;
                    Object.entries(itemBonus).forEach(([stat, value]) => {
                        results.flat[stat] = (results.flat[stat] || 0) + value;
                    });
                }
            }
            
            results.bySlot[slotType] = slotBonus;
        });
        
        return results;
    }

    // Проверка, является ли слот бижутерией
    isJewelrySlot(slotType) {
        return this.jewelrySlots.includes(slotType);
    }

    // Проверка, является ли слот оружием
    isWeaponSlot(slotType) {
        return this.weaponSlots.includes(slotType);
    }

    // Проверка, является ли слот обычной экипировкой
    isEquipmentSlot(slotType) {
        return this.equipmentSlots.includes(slotType);
    }

    getRuneBonuses() {
        return this.runeStats;
    }

    getRuneBonusData() {
        return this.runeBonuses;
    }

    reset() {
        this.runeStats = {};
    }
}

// Создаем глобальный экземпляр
window.runeCalculator = new RuneCalculator();