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
        this.runeStats[slotType] = runeLevel;
    }

    // применение бонусов рун к базовым статам
    applyRuneBonuses(totalStats, equipmentStats) {
        const stats = { ...totalStats };
        
        Object.keys(this.runeStats).forEach(slotType => {
            const runeLevel = this.runeStats[slotType];
            const runeBonus = this.runeBonuses[runeLevel];
            
            if (!runeBonus) return;

            let bonusMultiplier = 0;
            if (this.equipmentSlots.includes(slotType)) {
                bonusMultiplier = runeBonus.equipment;
            } else if (this.jewelrySlots.includes(slotType)) {
                bonusMultiplier = runeBonus.jewelry;
            } else if (this.weaponSlots.includes(slotType)) {
                bonusMultiplier = runeBonus.weapon;
            }

            if (bonusMultiplier > 0) {
                // Применяем бонусы к базовой броне
                this.applyRuneBonusToSlot(stats, slotType, bonusMultiplier);
                
                // Применяем бонусы к дополнительным статам экипировки
                if (equipmentStats && equipmentStats[slotType]) {
                    equipmentStats[slotType].forEach(equipStats => {
                        Object.keys(equipStats).forEach(statKey => {
                            const equipmentValue = equipStats[statKey];
                            const bonusValue = Math.round(equipmentValue * bonusMultiplier);
                            
                            if (stats[statKey] !== undefined) {
                                stats[statKey] += bonusValue;
                            }
                        });
                    });
                }
            }
        });
        
        return stats;
    }

    // применение бонусов рун к базовым статам
    applyRuneBonusToSlot(totalStats, slotType, bonusMultiplier) {
        if (!window.armorCalculator || !window.currentClass || !window.equipmentData) {
            return;
        }

        try {
            const slotData = window.equipmentData[slotType];
            if (!slotData) return;

            // Получаем базовые значения брони для этого слота
            const baseArmor = window.armorCalculator.getBaseArmor(
                window.currentClass,
                slotType,
                slotData.equipmentType || '3-stat',
                slotData.quality || 'orange',
                slotData.quality || 'orange'
            );

            if (baseArmor) {
                // Применяем бонус рун к базовой броне
                if (baseArmor.armour) {
                    const armorBonus = Math.round(baseArmor.armour * bonusMultiplier);
                    totalStats.armour = (totalStats.armour || 0) + armorBonus;
                }

                if (baseArmor.spell_armour) {
                    const spellArmorBonus = Math.round(baseArmor.spell_armour * bonusMultiplier);
                    totalStats.spell_armour = (totalStats.spell_armour || 0) + spellArmorBonus;
                }

                // Блок применяем только для щита
                if (baseArmor.block && slotType === 'lhand' && slotData.leftHandType === 'shield') {
                    const blockBonus = Math.round(baseArmor.block * bonusMultiplier);
                    totalStats.block = (totalStats.block || 0) + blockBonus;
                }
            }
        } catch (error) {
            console.error(`Ошибка применения бонусов рун к слоту ${slotType}:`, error);
        }
    }

    // Метод для расчета бонуса рун для конкретного слота и статистик
    calculateRuneBonusForEquipment(slotType, runeLevel, equipmentStats) {
        if (!this.runeBonuses[runeLevel] || !equipmentStats) return {};

        let bonusMultiplier = 0;
        if (this.equipmentSlots.includes(slotType)) {
            bonusMultiplier = this.runeBonuses[runeLevel].equipment;
        } else if (this.jewelrySlots.includes(slotType)) {
            bonusMultiplier = this.runeBonuses[runeLevel].jewelry;
        } else if (this.weaponSlots.includes(slotType)) {
            bonusMultiplier = this.runeBonuses[runeLevel].weapon;
        }

        const bonus = {};
        if (bonusMultiplier > 0) {
            Object.keys(equipmentStats).forEach(statKey => {
                const equipmentValue = equipmentStats[statKey];
                const bonusValue = Math.round(equipmentValue * bonusMultiplier);
                bonus[statKey] = bonusValue;
            });
        }

        return bonus;
    }

    // Расчет бонусов рун для статистик
    calculateRuneBonuses(equipmentStats, runeLevel) {
        if (!this.runeBonuses[runeLevel] || !equipmentStats) return {};

        const bonusMultiplier = this.runeBonuses[runeLevel].equipment;
        const bonus = {};

        if (bonusMultiplier > 0) {
            Object.keys(equipmentStats).forEach(statKey => {
                const equipmentValue = equipmentStats[statKey];
                const bonusValue = Math.round(equipmentValue * bonusMultiplier);
                bonus[statKey] = bonusValue;
            });
        }

        return bonus;
    }

    getRuneBonusForSlot(slotType, runeLevel) {
        if (!this.runeBonuses[runeLevel]) return 0;
        
        // Для щита используем бонус оружия
        if (slotType === 'shield' || (slotType === 'lhand' && window.equipmentData?.lhand?.leftHandType === 'shield')) {
            return this.runeBonuses[runeLevel].weapon;
        }
        
        if (this.equipmentSlots.includes(slotType)) {
            return this.runeBonuses[runeLevel].equipment;
        } else if (this.jewelrySlots.includes(slotType)) {
            return this.runeBonuses[runeLevel].jewelry;
        } else if (this.weaponSlots.includes(slotType)) {
            return this.runeBonuses[runeLevel].weapon;
        }
        
        return 0;
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
