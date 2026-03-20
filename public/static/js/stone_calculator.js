class StoneCalculator {
    constructor() {
        this.stoneStats = {};
        
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
}
window.stoneCalculator = new StoneCalculator();