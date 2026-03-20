// elixir_calculator.js
class ElixirCalculator {
    constructor() {
        try {
            this.guildBuff = false;
            this.guildBuffBonus = 0.03;
            this.guildBuffHealthBonus = 0.05;
            this.guildBuffCritResistanceBonus = 0.05;

            this.elixirBonuses = {
                'none': { stats: {} },
                'battle10': { stats: { 'attack_speed': 0.10, 'attack_power': 0.10, 'hit': 0.10, 'crit': 0.10 } },
                'battle15': { stats: { 'attack_speed': 0.15, 'attack_power': 0.15, 'hit': 0.15, 'crit': 0.15 } },
                'agility10': { stats: { 'resist': 0.10, 'dodge': 0.10, 'parry': 0.10, 'crit_damage_resistance': 0.10 } },
                'agility15': { stats: { 'resist': 0.15, 'dodge': 0.15, 'parry': 0.15, 'crit_damage_resistance': 0.15 } },
                'health10': { stats: { 'hp': 0.10, 'armour': 0.10, 'spell_armour': 0.10, 'crit_damage_resistance': 0.10 } },
                'health15': { stats: { 'hp': 0.15, 'armour': 0.15, 'spell_armour': 0.15, 'crit_damage_resistance': 0.15 } },
                'defense10': { stats: { 'block': 0.10, 'armour': 0.10, 'spell_armour': 0.10, 'crit_damage_resistance': 0.10 } },
                'defense15': { stats: { 'block': 0.15, 'armour': 0.15, 'spell_armour': 0.15, 'crit_damage_resistance': 0.15 } }
            };
        } catch (error) {
            console.error('Ошибка при инициализации ElixirCalculator:', error);
            throw error;
        }
    }
}