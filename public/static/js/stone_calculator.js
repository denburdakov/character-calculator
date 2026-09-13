class StoneCalculator {
    constructor() {
        this.stoneStats = {};

        this.stoneBonuses = {
            /* ====================================================
               КАМНИ СИЛЫ (абсолютные значения) — 10 уровней
               ==================================================== */
            'hp':                     { values: [232, 310, 425, 580, 775, 1005, 1275, 1585, 1935, 2320], type: 'absolute' },
            'mp':                     { values: [140, 185, 255, 350, 465, 605, 765, 950, 1160, 1392], type: 'absolute' },
            'hp_reg':                 { values: [54, 70, 95, 130, 175, 230, 295, 370, 450, 534],     type: 'absolute' },
            'mp_reg':                 { values: [18, 24, 34, 46, 62, 81, 103, 128, 157, 188],         type: 'absolute' },
            'attack_power':           { values: [42, 55, 75, 105, 140, 180, 230, 285, 350, 418],       type: 'absolute' },
            'armour':                 { values: [498, 665, 915, 1245, 1660, 2160, 2740, 3405, 4155, 4986], type: 'absolute' },
            'spell_armour':           { values: [498, 665, 915, 1245, 1660, 2160, 2740, 3405, 4155, 4986], type: 'absolute' },
            'hit':                    { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],       type: 'absolute' },
            'crit_damage_resistance': { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],       type: 'absolute' },
            'dodge':                  { values: [120, 160, 220, 300, 400, 520, 665, 825, 1005, 1206],  type: 'absolute' },
            'parry':                  { values: [120, 160, 220, 300, 400, 520, 665, 825, 1005, 1206],  type: 'absolute' },
            'resist':                 { values: [120, 160, 220, 300, 400, 520, 665, 825, 1005, 1206],  type: 'absolute' },
            'block':                  { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],       type: 'absolute' },
            'crit':                   { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],       type: 'absolute' },
            'attack_speed':           { values: [46, 60, 85, 120, 165, 215, 270, 330, 395, 464],       type: 'absolute' },

            /* ====================================================
               КАМНИ КОНЦЕНТРАЦИИ (процент) — 10 уровней
               Один общий % на выбор характеристики
               ==================================================== */
            'concentration':          { values: [0.50, 0.67, 0.92, 1.25, 1.67, 2.17, 2.75, 3.42, 4.17, 5.00], type: 'concentration' },

            /* ====================================================
               ОРУЖЕЙНЫЕ КАМНИ (процент) — 5 уровней (как было)
               ==================================================== */
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
        };
    }

    /** Получить значение камня по id/уровню */
    getValue(stoneId, level) {
        const data = this.stoneBonuses[stoneId];
        if (!data) return 0;
        return data.values[level - 1] || 0;
    }

    /** Максимальный уровень для данного типа камня */
    getMaxLevel(stoneId) {
        const data = this.stoneBonuses[stoneId];
        return data ? data.values.length : 0;
    }
}
window.stoneCalculator = new StoneCalculator();