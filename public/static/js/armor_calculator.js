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
                'belt': { armour: 2389, spell_armour: 933 },
                'shield': { block: 3056 }
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
                'belt': { armour: 1866, spell_armour: 1190 },
                'shield': { block: 3056 }
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

    getBaseArmor(className, slotType, equipmentType, quality, subType) {
        // Для обычных слотов брони
        if (this.baseArmorValues[className] && this.baseArmorValues[className][slotType]) {
            return this.baseArmorValues[className][slotType];
        }
        
        // Для плаща
        if (slotType === 'cape' && quality && this.capeBaseArmorValues[quality]) {
            return this.capeBaseArmorValues[quality];
        }
        
        // Для щита
        if (slotType === 'shield' && this.baseArmorValues[className] && 
            this.baseArmorValues[className]['shield']) {
            return this.baseArmorValues[className]['shield'];
        }
        
        return { armour: 0, spell_armour: 0, block: 0 };
    }
}

if (typeof window !== 'undefined') {
    window.armorCalculator = new ArmorCalculator();
}