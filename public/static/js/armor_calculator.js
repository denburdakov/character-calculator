class ArmorCalculator {
    constructor() {
        this.baseArmorValues = {
            'warrior': {
                'helm': { armour: 4778, spell_armour: 1866 },
                'shoulders': { armour: 1500, spell_armour: 1500 },
                'chest': { armour: 9556, spell_armour: 3723 },
                'pants': { armour: 9556, spell_armour: 3723 },
                'boots': { armour: 4778, spell_armour: 1866 },
                'hands': { armour: 4778, spell_armour: 1866 },
                'bracers': { armour: 2389, spell_armour: 933 },
                'belt': { armour: 2389, spell_armour: 933 }
            },
            'mage': {
                'helm': { armour: 1866, spell_armour: 4778 },
                'shoulders': { armour: 2799, spell_armour: 7167 },
                'chest': { armour: 3732, spell_armour: 9556 },
                'pants': { armour: 3732, spell_armour: 9556 },
                'boots': { armour: 1866, spell_armour: 4778 },
                'hands': { armour: 1866, spell_armour: 4778 },
                'bracers': { armour: 933, spell_armour: 2389 },
                'belt': { armour: 933, spell_armour: 2389 }
            },
            'archer': {
                'helm': { armour: 2986, spell_armour: 2986 },
                'shoulders': { armour: 4479, spell_armour: 4479 },
                'chest': { armour: 5972, spell_armour: 5972 },
                'pants': { armour: 5972, spell_armour: 5972 },
                'boots': { armour: 2986, spell_armour: 2986 },
                'hands': { armour: 2986, spell_armour: 2986 },
                'bracers': { armour: 1493, spell_armour: 1493 },
                'belt': { armour: 1493, spell_armour: 1493 }
            },
            'priest': {
                'helm': { armour: 3732, spell_armour: 2380 },
                'shoulders': { armour: 5599, spell_armour: 3570 },
                'chest': { armour: 7465, spell_armour: 4761 },
                'pants': { armour: 7465, spell_armour: 4761 },
                'boots': { armour: 3732, spell_armour: 2380 },
                'hands': { armour: 3732, spell_armour: 2380 },
                'bracers': { armour: 1866, spell_armour: 1190 },
                'belt': { armour: 1866, spell_armour: 1190 }
            },
            'rogue': {
                'helm': { armour: 2986, spell_armour: 2986 },
                'shoulders': { armour: 4479, spell_armour: 4479 },
                'chest': { armour: 5972, spell_armour: 5972 },
                'pants': { armour: 5972, spell_armour: 5972 },
                'boots': { armour: 2986, spell_armour: 2986 },
                'hands': { armour: 2986, spell_armour: 2986 },
                'bracers': { armour: 1493, spell_armour: 1493 },
                'belt': { armour: 1493, spell_armour: 1493 }
            }
        };

        // Базовые значения брони для плащей
        this.capeBaseArmorValues = {
            'orange': { armour: 7588, spell_armour: 7588 },
            'red': { armour: 9204, spell_armour: 9204 }
        };

        // Базовые значения брони для оранжевой бижутерии
        this.jewelryBaseArmorValues = {
            'purple': { armour: 0, spell_armour: 0 }, // Фиолетовая бижа не дает брони
            'orange': { armour: 0, spell_armour: 0 } // Базовая броня без рун
        };

        // Базовые значения блока для щита
        this.shieldBaseBlock = {
            'block': 3056
        };

        // Бонусы брони от рун улучшения для бижутерии
        this.jewelryRuneBonuses = {
            0: { armour: 1269, spell_armour: 1269 },
            1: { armour: 1369, spell_armour: 1369 },
            2: { armour: 1586, spell_armour: 1586 },
            3: { armour: 1840, spell_armour: 1840 },
            4: { armour: 2221, spell_armour: 2221 },
            5: { armour: 2728, spell_armour: 2728 },
            6: { armour: 2928, spell_armour: 2928 },
            7: { armour: 2928, spell_armour: 2928 },
            8: { armour: 2726, spell_armour: 2726 },
            9: { armour: 2928, spell_armour: 2928 },
            10: { armour: 2928, spell_armour: 2928 },
            11: { armour: 2928, spell_armour: 2928 },
            12: { armour: 2928, spell_armour: 2928 }
        };
    }

    calculateJewelryArmorWithRunes(characterClass, equipmentData, runeCalculator) {
        let totalJewelryArmor = { armour: 0, spell_armour: 0 };
        
        if (!equipmentData || !characterClass) {
            return totalJewelryArmor;
        }

        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        
        jewelrySlots.forEach(slotType => {
            const slotData = equipmentData[slotType];
            if (!slotData) return;

            // Только оранжевая бижутерия дает броню от рун
            if (slotData.quality === 'orange') {
                // Получаем бонусы рун для текущего уровня руны
                const runeBonus = this.jewelryRuneBonuses[slotData.runeLevel] || this.jewelryRuneBonuses[0];
                
                // Добавляем только бонус от рун (базовая броня бижутерии = 0)
                const armorBonus = runeBonus.armour || 0;
                const spellArmorBonus = runeBonus.spell_armour || 0;

                totalJewelryArmor.armour += armorBonus;
                totalJewelryArmor.spell_armour += spellArmorBonus;
            }
        });

        return totalJewelryArmor;
    }

    // Получить базовые значения брони для класса и слота
    getBaseArmor(classType, slotType, equipmentType = '3-stat', capeQuality = 'orange', jewelryQuality = 'orange') {

        // Для бижутерии используем специальные значения
        if (this.isJewelrySlot(slotType)) {
            return { armour: 0, spell_armour: 0 };
        }

        if (slotType === 'lhand' && window.equipmentData?.lhand?.leftHandType === 'shield') {
            const shieldBlock = { ...this.shieldBaseBlock };
            if (!shieldBlock || !shieldBlock.block) {
                console.error('Не найдены значения блока для щита');
            }
            return shieldBlock;
        }

        // Для оружия (не щита)
        if (this.isWeaponSlot(slotType)) {
            return { armour: 0, spell_armour: 0, block: 0 };
        }

        // Для плаща используем специальные значения
        if (slotType === 'cape') {
            const capeArmor = this.capeBaseArmorValues[capeQuality] || this.capeBaseArmorValues['orange'];
            if (!capeArmor) {
                console.error(`Не найдены значения брони для плаща качества: ${capeQuality}`);
                return { armour: 0, spell_armour: 0 };
            }
            return capeArmor;
        }

        // Для остальных слотов используем стандартную логику
        if (!this.baseArmorValues[classType]) {
            console.error(`Не найден класс: ${classType}`);
            return { armour: 0, spell_armour: 0 };
        }

        if (!this.baseArmorValues[classType][slotType]) {
            console.error(`Не найден слот ${slotType} для класса: ${classType}`);
            return { armour: 0, spell_armour: 0 };
        }

        return { ...this.baseArmorValues[classType][slotType] };
    }

    // Добавляем метод для проверки оружейных слотов
    isWeaponSlot(slotType) {
        const weaponSlots = ['rhand', 'lhand', 'rlhand'];
        return weaponSlots.includes(slotType);
    }


    // Проверить, является ли слот броневым слотом
    isArmorSlot(slotType) {
        const armorSlots = [
            'helm', 'shoulders', 'chest', 'pants', 'boots', 
            'hands', 'bracers', 'belt', 'cape', 'shield',
            'neck', 'ring1', 'ring2', 'trinket1', 'trinket2'
        ];
        return armorSlots.includes(slotType);
    }

    // Проверить, является ли слот бижутерией
    isJewelrySlot(slotType) {
        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        return jewelrySlots.includes(slotType);
    }

    // Получить все базовые значения для класса (для отображения в интерфейсе)
    getAllBaseArmorForClass(classType) {
        if (!classType) {
            console.error('Не передан класс для получения базовых значений брони');
            return {};
        }

        const result = {};
        const slots = ['helm', 'shoulders', 'chest', 'pants', 'boots', 'hands', 'bracers', 'belt'];
        
        slots.forEach(slot => {
            result[slot] = this.getBaseArmor(classType, slot);
        });

        return result;
    }

    // Получить базовые значения для плаща по качеству
    getCapeBaseArmor(quality) {
        const capeArmor = this.capeBaseArmorValues[quality] || this.capeBaseArmorValues['orange'];
        if (!capeArmor) {
            console.error(`Не найдены значения брони для плаща качества: ${quality}`);
        }
        return capeArmor;
    }

    // Получить базовые значения брони для бижутерии по качеству
    getJewelryBaseArmor(quality) {
        // Бижутерия не дает базовой брони, только от рун
        return { armour: 0, spell_armour: 0 };
    }

    // Получить бонусы рун для бижутерии
    getJewelryRuneBonuses(runeLevel) {
        return this.jewelryRuneBonuses[runeLevel] || this.jewelryRuneBonuses[0];
    }

    // Получить базовые значения блока для щита
    getShieldBaseBlock() {
        const shieldBlock = { ...this.shieldBaseBlock };
        if (!shieldBlock) {
            console.error('Не найдены значения блока для щита');
        }
        return shieldBlock;
    }

    // Метод для расчета базовой брони с учетом рун
    calculateBaseArmorWithRunes(characterClass, equipmentData, runeCalculator) {
        let totalArmor = { armour: 0, spell_armour: 0, block: 0 };
        
        if (!equipmentData || !characterClass) {
            return totalArmor;
        }

        // Броня от обычной экипировки
        const armorSlots = ['helm', 'shoulders', 'chest', 'pants', 'boots', 'hands', 'bracers', 'belt', 'cape'];
        
        armorSlots.forEach(slotType => {
            const slotData = equipmentData[slotType];
            if (!slotData) return;

            // Получаем базовую броню для слота
            const baseArmor = this.getBaseArmor(
                characterClass,
                slotType,
                slotData.equipmentType || '3-stat',
                slotData.quality || 'orange',
                slotData.quality || 'orange'
            );

            if (baseArmor) {
                let runeMultiplier = 0;
                
                // Получаем множитель рун если есть
                if (runeCalculator && slotData.runeLevel) {
                    runeMultiplier = runeCalculator.getRuneBonusForSlot(slotType, slotData.runeLevel) || 0;
                }

                // Добавляем базовую броню и бонус от рун
                const armorBonus = Math.round((baseArmor.armour || 0) * runeMultiplier);
                const spellArmorBonus = Math.round((baseArmor.spell_armour || 0) * runeMultiplier);
                const blockBonus = Math.round((baseArmor.block || 0) * runeMultiplier);

                totalArmor.armour += (baseArmor.armour || 0) + armorBonus;
                totalArmor.spell_armour += (baseArmor.spell_armour || 0) + spellArmorBonus;
                
                // Блок добавляем только для щита
                if (slotType === 'lhand' && slotData.leftHandType === 'shield') {
                    totalArmor.block += (baseArmor.block || 0) + blockBonus;
                    console.log(`🛡️ База блока щита: ${baseArmor.block}, бонус рун: ${blockBonus}, итого: ${(baseArmor.block || 0) + blockBonus}`);
                }
            }
        });

        // Добавляем броню от бижутерии
        const jewelryArmor = this.calculateJewelryArmorWithRunes(characterClass, equipmentData, runeCalculator);
        totalArmor.armour += jewelryArmor.armour;
        totalArmor.spell_armour += jewelryArmor.spell_armour;

        console.log(`🔍 Итоговая базовая броня: ${totalArmor.armour} физ.брони, ${totalArmor.spell_armour} маг.брони`);
        return totalArmor;
    }

}

if (typeof window !== 'undefined') {
    window.armorCalculator = new ArmorCalculator();
}