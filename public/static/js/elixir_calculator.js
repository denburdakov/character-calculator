// elixir_calculator.js
class ElixirCalculator {
    constructor() {
        try {
            this.elixirStats = {
                offensive: 'none',
                defensive: 'none'
            };
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

    setElixirs(offensiveElixir, defensiveElixir) {
        try {
            if (!this.elixirBonuses.hasOwnProperty(offensiveElixir)) {
                console.error(`Неизвестный тип наступательного эликсира: ${offensiveElixir}`);
                return false;
            }
            if (!this.elixirBonuses.hasOwnProperty(defensiveElixir)) {
                console.error(`Неизвестный тип защитного эликсира: ${defensiveElixir}`);
                return false;
            }

            this.elixirStats.offensive = offensiveElixir;
            this.elixirStats.defensive = defensiveElixir;
            return true;
        } catch (error) {
            console.error('Ошибка в setElixirs:', error);
            return false;
        }
    }

    setGuildBuff(enabled) {
        try {
            this.guildBuff = Boolean(enabled);
        } catch (error) {
            console.error('Ошибка в setGuildBuff:', error);
        }
    }

    applyPercentageBonuses(totalStats, baseForPercentage) {
        try {
            if (!totalStats || typeof totalStats !== 'object') {
                return totalStats;
            }
            
            const stats = { ...totalStats };
            
            // Применяем бонусы эликсиров
            this.applyElixirBonuses(stats, baseForPercentage);
            
            // ГИЛЬДЕЙСКИЙ БАФФ ПРИМЕНЯЕТСЯ ТОЛЬКО ЗДЕСЬ
            if (this.guildBuff) {
                this.applyGuildBuff(stats, baseForPercentage);
            }

            return stats;
        } catch (error) {
            console.error('Ошибка в applyPercentageBonuses:', error);
            return totalStats;
        }
    }

applyGuildBuffToStats(stats, baseForPercentage) {
    try {
        if (!stats || !baseForPercentage) {
            console.error('Некорректные параметры в applyGuildBuffToStats');
            return stats;
        }

        const result = { ...stats };

        // Основной бонус 3% ко ВСЕМ статам кроме скорости передвижения
        Object.keys(baseForPercentage).forEach(stat => {
            // Исключаем только скорость передвижения из гильдейского баффа
            if (stat !== 'speed' && typeof baseForPercentage[stat] === 'number') {
                const baseValue = baseForPercentage[stat];
                const bonusValue = Math.round(baseValue * this.guildBuffBonus);
                
                if (bonusValue > 0) {
                    result[stat] = (result[stat] || 0) + bonusValue;
                }
            }
        });

        // Дополнительный бонус 5% к здоровью (поверх основного 3%)
        if (baseForPercentage.hp !== undefined) {
            const baseHP = baseForPercentage.hp;
            const healthBonus = Math.round(baseHP * this.guildBuffHealthBonus);
            
            if (healthBonus > 0) {
                result.hp = (result.hp || 0) + healthBonus;
            }
        }

        // Дополнительный бонус 5% к сопротивлению критическому урону (поверх основного 3%)
        if (baseForPercentage.crit_damage_resistance !== undefined) {
            const baseCritResistance = baseForPercentage.crit_damage_resistance;
            const critResistanceBonus = Math.round(baseCritResistance * this.guildBuffCritResistanceBonus);
            
            if (critResistanceBonus > 0) {
                result.crit_damage_resistance = (result.crit_damage_resistance || 0) + critResistanceBonus;
            }
        }

        return result;
    } catch (error) {
        console.error('Ошибка в applyGuildBuffToStats:', error);
        return stats;
    }
}

    applyElixirBonuses(stats, baseForPercentage) {
        try {
            const offensiveElixir = this.elixirStats.offensive;
            const defensiveElixir = this.elixirStats.defensive;
            
            if (offensiveElixir && offensiveElixir !== 'none') {
                const offensiveBonus = this.elixirBonuses[offensiveElixir];
                if (offensiveBonus && offensiveBonus.stats) {
                    Object.keys(offensiveBonus.stats).forEach(stat => {
                        if (baseForPercentage && baseForPercentage[stat] !== undefined) {
                            const bonusValue = parseFloat(baseForPercentage[stat]) * offensiveBonus.stats[stat];
                            stats[stat] += bonusValue;
                        }
                    });
                }
            }

            if (defensiveElixir && defensiveElixir !== 'none') {
                const defensiveBonus = this.elixirBonuses[defensiveElixir];
                if (defensiveBonus && defensiveBonus.stats) {
                    Object.keys(defensiveBonus.stats).forEach(stat => {
                        if (baseForPercentage && baseForPercentage[stat] !== undefined) {
                            const bonusValue = parseFloat(baseForPercentage[stat]) * defensiveBonus.stats[stat];
                            stats[stat] += bonusValue;
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка в applyElixirBonuses:', error);
        }
    }

    applyGuildBuff(stats, baseForPercentage) {
        try {
            if (!stats || !baseForPercentage) {
                console.error('Некорректные параметры в applyGuildBuff');
                return;
            }

            // Основной бонус 3% ко ВСЕМ статам кроме скорости атаки
            Object.keys(baseForPercentage).forEach(stat => {
                // Исключаем только скорость передвижение из гильдейского баффа
                if (stat !== 'speed' && typeof baseForPercentage[stat] === 'number') {
                    const bonusValue = Math.round(baseForPercentage[stat] * this.guildBuffBonus);
                    stats[stat] = (stats[stat] || 0) + bonusValue;
                }
            });

            // Дополнительный бонус 5% к здоровью (поверх основного 3%)
            if (baseForPercentage.hp !== undefined) {
                const healthBonus = Math.round(baseForPercentage.hp * this.guildBuffHealthBonus);
                stats.hp += healthBonus;
            } else {
                console.warn('Параметр hp не найден в baseForPercentage для гильдейского баффа');
            }

            // Дополнительный бонус 5% к сопротивлению критическому урону (поверх основного 3%)
            if (baseForPercentage.crit_damage_resistance !== undefined) {
                const critResistanceBonus = Math.round(baseForPercentage.crit_damage_resistance * this.guildBuffCritResistanceBonus);
                stats.crit_damage_resistance += critResistanceBonus;
            } else {
                console.warn('Параметр crit_damage_resistance не найден в baseForPercentage для гильдейского баффа');
            }

        } catch (error) {
            console.error('Ошибка в applyGuildBuff:', error);
        }
    }

    // Применение бонусов к броне отдельно
    applyArmorBonuses(armorValues, baseForPercentage) {
        try {
            if (!armorValues || typeof armorValues !== 'object') {
                console.error('Некорректный параметр armorValues:', armorValues);
                return armorValues;
            }

            let result = { ...armorValues };
            const defensiveElixir = this.elixirStats.defensive;
            
            // Применяем бонусы от защитных эликсиров к броне
            if (defensiveElixir && defensiveElixir !== 'none') {
                const defensiveBonus = this.elixirBonuses[defensiveElixir];
                if (defensiveBonus && defensiveBonus.stats) {
                    if (defensiveBonus.stats.armour) {
                        const bonusValue = Math.round((result.armour || 0) * defensiveBonus.stats.armour);
                        result.armour = (result.armour || 0) + bonusValue;
                    }
                    if (defensiveBonus.stats.spell_armour) {
                        const bonusValue = Math.round((result.spell_armour || 0) * defensiveBonus.stats.spell_armour);
                        result.spell_armour = (result.spell_armour || 0) + bonusValue;
                    }
                    if (defensiveBonus.stats.block) {
                        const bonusValue = Math.round((result.block || 0) * defensiveBonus.stats.block);
                        result.block = (result.block || 0) + bonusValue;
                    }
                }
            }

            // Применяем гильдейский бафф к броне и блоку
            if (this.guildBuff && baseForPercentage) {
                // Бонус 3% к броне
                if (baseForPercentage.armour !== undefined) {
                    const armourBonus = Math.round(baseForPercentage.armour * this.guildBuffBonus);
                    result.armour = (result.armour || 0) + armourBonus;
                }
                
                // Бонус 3% к магической броне
                if (baseForPercentage.spell_armour !== undefined) {
                    const spellArmourBonus = Math.round(baseForPercentage.spell_armour * this.guildBuffBonus);
                    result.spell_armour = (result.spell_armour || 0) + spellArmourBonus;
                }
                
                // Бонус 3% к блоку
                if (baseForPercentage.block !== undefined) {
                    const blockBonus = Math.round(baseForPercentage.block * this.guildBuffBonus);
                    result.block = (result.block || 0) + blockBonus;
                }
            }

            return result;
        } catch (error) {
            console.error('Ошибка в applyArmorBonuses:', error);
            return armorValues;
        }
    }

    getElixirBonuses() {
        try {
            return {
                offensive: this.elixirStats.offensive,
                defensive: this.elixirStats.defensive,
                guildBuff: this.guildBuff
            };
        } catch (error) {
            console.error('Ошибка в getElixirBonuses:', error);
            return {
                offensive: 'none',
                defensive: 'none',
                guildBuff: false
            };
        }
    }

    getElixirData() {
        try {
            return this.elixirBonuses;
        } catch (error) {
            console.error('Ошибка в getElixirData:', error);
            return {};
        }
    }

    reset() {
        try {
            this.elixirStats = {
                offensive: 'none',
                defensive: 'none'
            };
            this.guildBuff = false;
        } catch (error) {
            console.error('Ошибка в reset:', error);
        }
    }
}